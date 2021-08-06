import { getPath, pathToQuerySelector } from './tree-util';

let tabId: number;

// Send a message to the content script to audit the current page.
// Need to do this every time the popup is opened.
chrome?.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
  tabId = tabs[0].id!;

  window.addEventListener('blur', () => {
    clearHighlight('form-troubleshooter-highlight');
    clearHighlight('form-troubleshooter-highlight-hover');
  });
});

function showHighlight(selector: string, className: string, scrollIntoView: boolean): void {
  if (chrome?.tabs) {
    chrome.tabs.sendMessage(tabId, { message: 'highlight', selector, className, scroll: scrollIntoView });
  } else {
    console.log('simulating highlight', selector, className, scrollIntoView);
  }
}

function clearHighlight(className: string): void {
  if (chrome?.tabs) {
    chrome.tabs.sendMessage(tabId, { message: 'clear highlight', className });
  } else {
    console.log('simulating clear highlight', className);
  }
}

export function handleHighlightClick(item: TreeNodeWithParent): void {
  const path = getPath(item);
  const selector = pathToQuerySelector(path);
  showHighlight(selector, 'form-troubleshooter-highlight', true);
}

export function handleHighlightMouseEnter(item: TreeNodeWithParent): void {
  const path = getPath(item);
  const selector = pathToQuerySelector(path);
  showHighlight(selector, 'form-troubleshooter-highlight-hover', false);
}

export function handleHighlightMouseLeave(item: TreeNodeWithParent): void {
  clearHighlight('form-troubleshooter-highlight-hover');
}
