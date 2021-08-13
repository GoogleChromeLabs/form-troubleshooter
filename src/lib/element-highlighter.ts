import { getPath, pathToQuerySelector } from './tree-util';

let tabId: number;

// Send a message to the content script to audit the current page.
// Need to do this every time the popup is opened.
chrome?.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
  tabId = tabs[0].id!;

  window.addEventListener('blur', () => {
    clearHighlight('click');
    clearHighlight('hover');
  });
});

function showHighlight(selector: string, type: 'click' | 'hover', scrollIntoView: boolean): void {
  if (chrome?.tabs) {
    chrome.tabs.sendMessage(tabId, { message: 'highlight', selector, type, scroll: scrollIntoView });
  } else {
    console.log('simulating highlight', { selector, type, scrollIntoView });
  }
}

function clearHighlight(type: 'click' | 'hover'): void {
  if (chrome?.tabs) {
    chrome.tabs.sendMessage(tabId, { message: 'clear highlight', type });
  } else {
    console.log('simulating clear highlight', { type });
  }
}

export function handleHighlightClick(item: TreeNodeWithParent): void {
  const path = getPath(item);
  const selector = pathToQuerySelector(path);
  showHighlight(selector, 'click', true);
}

export function handleHighlightMouseEnter(item: TreeNodeWithParent): void {
  const path = getPath(item);
  const selector = pathToQuerySelector(path);
  showHighlight(selector, 'hover', false);
}

export function handleHighlightMouseLeave(item: TreeNodeWithParent): void {
  clearHighlight('hover');
}
