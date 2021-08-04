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

export function showHighlight(selector: string, className: string, scrollIntoView: boolean): void {
  if (chrome?.tabs) {
    chrome.tabs.sendMessage(tabId, { message: 'highlight', selector, className, scroll: scrollIntoView });
  } else {
    console.log('simulating highlight', selector, className, scrollIntoView);
  }
}

export function clearHighlight(className: string): void {
  if (chrome?.tabs) {
    chrome.tabs.sendMessage(tabId, { message: 'clear highlight', className });
  } else {
    console.log('simulating clear highlight', className);
  }
}
