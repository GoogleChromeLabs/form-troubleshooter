import { FunctionalComponent } from 'preact';
import { CustomHistory, route, Route, Router } from 'preact-router';

import Results from '../routes/results';
import NotFoundPage from '../routes/notfound';
import Header from './header';
import AuditSummary from './summary';
import { Tab, Tabs } from '@material-ui/core';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Details from '../routes/details';
import { getTreeNodeWithParents } from '../lib/tree-util';
import { runAudits } from '../lib/audits/audits';
import { createHashHistory } from 'history';
import style from './app.css';
import { generateHtmlString } from '../lib/save-html';
import Report from './report';
import { version } from '../../package.json';

const tabs = [
  {
    name: 'Recommendations',
    route: '/recommendations',
  },
  {
    name: 'Common mistakes',
    route: '/mistakes',
  },
  {
    name: 'Form details',
    route: '/details',
  },
];

interface SuggestedNameOption {
  suggestedName?: string;
}

function getDefaultHtmlFilename(url: string, date: Date) {
  const host = new URL(url).hostname;
  const localDate = new Date(date.valueOf() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .replace(/\..+$/, '')
    .replace(/[^\d]/g, '');
  return `${host}-${localDate}.html`;
}

async function saveFile(content: string, options: SaveFilePickerOptions) {
  const fileHandle = await window.showSaveFilePicker?.(options);

  let file: FileSystemWritableFileStream | undefined;
  try {
    file = await fileHandle.createWritable();
    await file.write(content);
  } finally {
    await file?.close();
  }
}

async function downloadOrSaveFile(content: string, options: SaveFilePickerOptions & SuggestedNameOption) {
  if (chrome?.downloads?.download) {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: options.suggestedName ?? 'form-audit.html',
    });
  } else {
    await saveFile(content, options);
  }
}

const App: FunctionalComponent = () => {
  const [tabInfo, setTabInfo] = useState({ title: 'Form audit', url: '' });
  const [currentUrl, setCurrentUrl] = useState('/');
  const history = useMemo(() => {
    const hist = createHashHistory();
    setCurrentUrl(hist.location.pathname);

    hist.listen(({ location }) => {
      setCurrentUrl(location.pathname);
    });
    return hist;
  }, []);
  const [tabIndex, setTabIndex] = useState(0);
  const [tree, setTree] = useState<TreeNode>();
  const richTree = useMemo(() => (tree ? getTreeNodeWithParents(tree) : undefined), [tree]);
  const auditResults = useMemo(
    () =>
      richTree
        ? runAudits(richTree)
        : {
            score: 0,
            errors: [],
            warnings: [],
          },
    [richTree],
  );
  const [saving, setSaving] = useState(false);
  const reportElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTabIndex(
      Math.max(
        tabs.findIndex(tab => tab.route === currentUrl),
        0,
      ),
    );
  }, [currentUrl]);

  // initial load, retrieve data
  useEffect(() => {
    // Send a message to the content script to audit the current page.
    // Need to do this every time the popup is opened.
    chrome?.tabs?.query({ active: true, currentWindow: true }, chromeTabs => {
      const tabId = chromeTabs[0].id;
      setTabInfo({
        title: chromeTabs[0].title ?? '',
        url: chromeTabs[0].url ?? '',
      });
      chrome.tabs.sendMessage(tabId!, { message: 'popup opened' });
    });

    if (chrome.runtime) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'stored element data') {
          chrome.storage.local.get(['tree'], result => {
            setTree(result.tree);
          });
        }
      });
    } else {
      (async () => {
        // test data for development
        const params = new URLSearchParams(window.location.search.replace('?', ''));
        const testDataFile = params.get('data');
        if (testDataFile) {
          const testData = await (await fetch(params.get('data') || '/test-data/score.json')).json();
          setTree(testData);
        }

        setTabInfo(prev => ({
          ...prev,
          url: window.location.href,
        }));
      })();
    }
  }, []);

  // activate default tab/route based on whether or not there are errors or warnings
  useEffect(() => {
    if (tree) {
      if (auditResults.errors.length === 0 && auditResults.warnings.length !== 0) {
        route('/mistakes', true);
      } else if (auditResults.errors.length === 0 && auditResults.warnings.length === 0) {
        route('/details', true);
      }
    }
  }, [auditResults, tree]);

  // generate report and save html document
  useEffect(() => {
    if (saving) {
      if (reportElement.current?.firstElementChild) {
        (async () => {
          await downloadOrSaveFile(
            await generateHtmlString(Array.from(reportElement.current?.children ?? []), {
              version,
              summary: {
                score: auditResults.score * 100,
                errors: auditResults.errors.length,
                warnings: auditResults.warnings.length,
              },
              tree,
            }),
            {
              suggestedName: getDefaultHtmlFilename(tabInfo.url, new Date()),
              types: [
                {
                  description: 'HTML document',
                  accept: {
                    'text/html': ['.html'],
                  },
                },
              ],
            },
          );
          setSaving(false);
        })();
      }
    }
  }, [auditResults.errors.length, auditResults.score, auditResults.warnings.length, saving, tabInfo.url, tree]);

  async function handleOpenFile() {
    const [fileHandle] = await window.showOpenFilePicker?.({
      types: [
        {
          description: 'JSON document',
          accept: {
            'text/*': ['.json'],
          },
        },
      ],
      multiple: false,
    });
    const file = await fileHandle.getFile();
    const contents = await file.text();
    setTree(JSON.parse(contents));
  }

  async function handleSaveFile() {
    await saveFile(JSON.stringify(tree), {
      types: [
        {
          description: 'JSON document',
          accept: {
            'text/*': ['.json'],
          },
        },
      ],
    });
  }

  async function handleSaveHtml() {
    setSaving(true);
  }

  return (
    <div id="preact_root">
      <Header
        onOpenJson={handleOpenFile}
        onSaveJson={tree ? handleSaveFile : undefined}
        onSaveHtml={tree ? handleSaveHtml : undefined}
      />
      <AuditSummary
        score={auditResults.score}
        recommendations={auditResults.errors}
        commonMistakes={auditResults.warnings}
      />
      <div class={style.tabWrapper}>
        <Tabs
          className={style.tabs}
          value={tabIndex}
          onChange={(event, newValue) => {
            setTabIndex(newValue);
            route(tabs[newValue].route);
          }}
        >
          {tabs.map(tab => (
            <Tab key={tab.name} label={tab.name} />
          ))}
        </Tabs>
      </div>
      {tree ? (
        <div class={style.content}>
          <Router history={history as unknown as CustomHistory}>
            <Redirect path="/" to="/recommendations" />
            <Redirect path="/index.html" to="/recommendations" />
            <Route path="/recommendations" component={Results} results={auditResults.errors} />
            <Route path="/mistakes" component={Results} results={auditResults.warnings} />
            <Route path="/details" component={Details} documentTree={richTree} />
            <NotFoundPage default />
          </Router>
        </div>
      ) : null}
      {saving ? (
        <div ref={reportElement} class={style.reportContainer}>
          <Report auditResults={auditResults} title={tabInfo.title} auditUrl={tabInfo.url} />
        </div>
      ) : null}
    </div>
  );
};

const Redirect: FunctionalComponent<{ to: string }> = props => {
  route(props.to, true);
  return null;
};

export default App;
