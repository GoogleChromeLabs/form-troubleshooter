import { FunctionalComponent, h } from 'preact';
import { CustomHistory, getCurrentUrl, route, Route, Router } from 'preact-router';

import Results from '../routes/results';
import NotFoundPage from '../routes/notfound';
import Header from './header';
import AuditSummary from './summary';
import { Tab, Tabs } from '@material-ui/core';
import { useEffect, useState } from 'preact/hooks';
import Details from '../routes/details';
import { getTreeNodeWithParents } from '../lib/tree-util';
import { runAudits } from '../lib/audits';
import { createHashHistory } from 'history';
import style from './app.css';

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

// hack to get silence typescript type warnings for history
const history = createHashHistory() as unknown as CustomHistory;

const App: FunctionalComponent = () => {
  const currentUrl = getCurrentUrl();
  const [tabIndex, setTabIndex] = useState(0);
  const [auditResults, setAuditResuits] = useState<AuditDetails>(() => ({
    score: 0,
    errors: [],
    warnings: [],
  }));
  const [tree, setTree] = useState<TreeNodeWithParent>();

  useEffect(() => {
    setTabIndex(
      Math.max(
        tabs.findIndex(tab => tab.route === currentUrl),
        0,
      ),
    );
  }, [currentUrl]);

  useEffect(() => {
    // Send a message to the content script to audit the current page.
    // Need to do this every time the popup is opened.
    chrome?.tabs?.query({ active: true, currentWindow: true }, chromeTabs => {
      const tabId = chromeTabs[0].id;
      chrome.tabs.sendMessage(tabId!, { message: 'popup opened' });
    });

    if (chrome.runtime) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'stored element data') {
          chrome.storage.local.get(['tree'], result => {
            const doc = getTreeNodeWithParents(result.tree);
            setTree(doc);
            setAuditResuits(runAudits(doc));
          });
        }
      });
    } else {
      (async () => {
        // test data for development
        const testData = (await import('../test-data/shadow-dom.json')) as unknown as TreeNode;
        const doc = getTreeNodeWithParents(testData);
        setTree(doc);
        setAuditResuits(runAudits(doc));
      })();
    }
  }, []);

  const recommendations = auditResults.errors;
  const commonMistakes = auditResults.warnings;

  return (
    <div id="preact_root">
      <Header />
      <AuditSummary score={auditResults.score} recommendations={recommendations} commonMistakes={commonMistakes} />
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
      <div class={style.content}>
        <Router history={history}>
          <Redirect path="/" to="/recommendations" />
          <Redirect path="/index.html" to="/recommendations" />
          <Route path="/recommendations" component={Results} results={recommendations} />
          <Route path="/mistakes" component={Results} results={commonMistakes} />
          <Route path="/details" component={Details} documentTree={tree} />
          <NotFoundPage default />
        </Router>
      </div>
    </div>
  );
};

const Redirect: FunctionalComponent<{ to: string }> = props => {
  route(props.to, true);
  return null;
};

export default App;
