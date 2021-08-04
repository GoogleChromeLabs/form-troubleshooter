import { FunctionalComponent, h } from 'preact';
import { getCurrentUrl, route, Route, Router } from 'preact-router';

import Results from '../routes/results';
import NotFoundPage from '../routes/notfound';
import Header from './header';
import AuditSummary from './summary';
import { Tab, Tabs } from '@material-ui/core';
import { useEffect, useState } from 'preact/hooks';
import Details from '../routes/details';

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

const App: FunctionalComponent = () => {
  const currentUrl = getCurrentUrl();
  const [tabIndex, setTabIndex] = useState(
    Math.max(
      tabs.findIndex(tab => tab.route === currentUrl),
      0,
    ),
  );
  const [auditResults] = useState({
    score: 0.78,
    results: [
      {
        type: 'error',
        title: 'Increase conversions by using correct autocomplete attributes',
      },
      {
        type: 'error',
        title:
          'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
      },
      {
        type: 'warning',
        title: 'Increase conversions by using correct autocomplete attributes',
      },
    ],
  });

  useEffect(() => {
    // Send a message to the content script to audit the current page.
    // Need to do this every time the popup is opened.
    chrome?.tabs?.query({ active: true, currentWindow: true }, chromeTabs => {
      const tabId = chromeTabs[0].id;
      chrome.tabs.sendMessage(tabId!, { message: 'popup opened' });
    });

    chrome?.runtime?.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === 'stored element data') {
        chrome.storage.local.get(['tree'], result => {
          console.log('tree', result.tree);
        });
      }
    });
  }, []);

  const recommendations = auditResults.results.filter(result => result.type === 'error');
  const commonMistakes = auditResults.results.filter(result => result.type !== 'error');

  return (
    <div id="preact_root">
      <Header />
      <AuditSummary score={auditResults.score} recommendations={recommendations} commonMistakes={commonMistakes} />
      <div class="tabWrapper">
        <Tabs
          className="tabs"
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
      <Router>
        <Redirect path="/" to="/recommendations" />
        <Route path="/recommendations" component={Results} results={recommendations} />
        <Route path="/mistakes/" component={Results} results={commonMistakes} />
        <Route path="/details/" component={Details} />
        <NotFoundPage default />
      </Router>
    </div>
  );
};

const Redirect: FunctionalComponent<{ to: string }> = props => {
  route(props.to, true);
  return null;
};

export default App;
