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
import Report from './report';
import { waitFor } from '../lib/wait-util';

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

async function saveFile(content: string | Promise<string>, options: SaveFilePickerOptions & SuggestedNameOption) {
  // show the file picker while waiting for content simultaneously
  const [fileHandle, fileContents] = await Promise.all([
    window.showSaveFilePicker?.(options),
    typeof content === 'string' ? Promise.resolve(content) : content,
  ]);

  let file: FileSystemWritableFileStream | undefined;
  try {
    file = await fileHandle.createWritable();
    await file.write(fileContents);
  } finally {
    await file?.close();
  }
}

interface TabInfo {
  title: string;
  url: string;
  icon?: string;
}

const App: FunctionalComponent = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo>({ title: 'Form audit', url: '' });
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
  const reportElement = useRef<Report>(null);

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
      chrome.tabs.sendMessage(tabId!, { message: 'get website icon' }, response => {
        setTabInfo(prev => ({ ...prev, icon: response?.src }));
      });
    });

    if (chrome.runtime) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'stored element data') {
          chrome.storage.local.get(['tree'], result => {
            setTree(JSON.parse(result.tree));
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

  async function handleOpenFile() {
    const [fileHandle] = await window.showOpenFilePicker?.({
      types: [
        {
          description: 'Saved HTML or JSON document',
          accept: {
            'text/*': ['.json', '.html'],
          },
        },
      ],
      multiple: false,
    });
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let json = contents;

    const scriptExpression = /<script type="text\/json" name="tree">(.+?)<\/script>/i;
    const treeScriptMatch = scriptExpression.exec(contents);
    if (treeScriptMatch) {
      json = treeScriptMatch[1];
    }

    setTree(JSON.parse(json));
  }

  async function handleSaveHtml() {
    setSaving(true);
    await saveFile(
      waitFor(() => reportElement.current!).then(ref => ref.getHtml()),
      {
        suggestedName: getDefaultHtmlFilename(tabInfo.url, new Date()),
        types: [
          {
            description: 'Saved HTML or JSON document',
            accept: {
              'text/*': ['.json', '.html'],
            },
          },
        ],
      },
    );
    setSaving(false);
  }

  return (
    <div id="preact_root">
      <Header onOpenJson={handleOpenFile} onSaveHtml={tree ? handleSaveHtml : undefined} />
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
        <div class={style.reportContainer}>
          <Report
            ref={reportElement}
            auditResults={auditResults}
            title={tabInfo.title}
            auditUrl={tabInfo.url}
            icon={tabInfo.icon}
            tree={tree}
          />
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
