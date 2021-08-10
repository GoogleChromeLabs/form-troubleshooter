/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getDocumentTree } from './dom-iterator';
import { sendMessageAndWait } from './messaging-util';
import { getElementRectangle, hideOverlay, Rectangle, showOverlay } from './overlay';
import { getWebsiteIcon } from './webpage-icon-util';

/* global chrome */

// Listen for a message from the popup that it has been opened.
// Need to re-run the audits here every time the popup is opened.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // only run on top most window/frame
  if (window.parent === window) {
    if (request.message === 'popup opened') {
      chrome.storage.local.clear(() => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error('chrome.storage.local.clear() error in content-script.js:', error);
        } else {
          getDocumentTree(document).then(tree => {
            chrome.storage.local.set({ tree }, () => {
              chrome.runtime.sendMessage({ message: 'stored element data' });
            });
          });
        }
      });
    } else if (request.message === 'highlight') {
      highlightElements(request.selector, request.type, request.scroll);
    } else if (request.message === 'get website icon') {
      getWebsiteIcon(document).then(info => {
        sendResponse(info);
      });
      return true;
    }
  } else if (
    (request.name === window.name && request.url === window.location.href) ||
    (request.name && request.name === window.name) || // in case the iframe gets redirected
    (request.url && request.url === window.location.href)
  ) {
    if (request.message === 'inspect') {
      getDocumentTree(document).then(tree => {
        sendResponse(tree);
      });
      return true;
    }
    if (request.message === 'highlight frame') {
      highlightElements(request.selector, request.type, request.scroll);
    }
    if (request.message === 'get element rectangle') {
      getRectangleBySelector(request.selector).then(rect => {
        sendResponse(rect);
      });
      return true;
    }
  }

  if (request.message === 'clear highlight') {
    clearHighlights(request.type);
  }
});

async function highlightElements(cssSelector: string, type: 'click' | 'hover', scroll: boolean) {
  const rect = await getRectangleBySelector(cssSelector);

  if (rect) {
    showOverlay(rect, type, scroll);
  }
}

async function getRectangleBySelector(cssSelector: string) {
  let currentRoot: Document | ShadowRoot = document;
  let roots = cssSelector.split(' > #shadow-root > ');
  const selector = roots[roots.length - 1];
  roots = roots.slice(0, roots.length - 1);

  for (const root of roots) {
    const customElement: Element | null = currentRoot.querySelector(root);
    if (customElement && customElement.shadowRoot) {
      currentRoot = customElement.shadowRoot;
    }
  }

  const element = currentRoot.querySelector(selector);
  if (element) {
    return getElementRectangle(element as HTMLElement);
  } else if (cssSelector.includes(' #document ')) {
    return await getIframeRectangle(selector);
  }
}

async function getIframeRectangle(cssSelector: string) {
  const result = /(.+?) > #document > (.+)/.exec(cssSelector);
  if (result) {
    const [match, first, selector] = result;
    if (match) {
      const iframe = document.querySelector(first) as HTMLIFrameElement;

      if (iframe) {
        const iframeRect = getElementRectangle(iframe);
        const innerRect: Rectangle | undefined = await sendMessageAndWait({
          broadcast: true,
          wait: true,
          message: 'get element rectangle',
          name: iframe.name,
          url: iframe.src,
          selector,
        });

        if (iframeRect && innerRect) {
          return {
            top: iframeRect.top + innerRect.top,
            left: iframeRect.left + innerRect.left,
            width: innerRect.width,
            height: innerRect.height,
          };
        }
      }
    }
  }
}

function clearHighlights(type: 'click' | 'hover') {
  hideOverlay(type);
}
