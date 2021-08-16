/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getDocumentTree } from './dom-iterator';
import { sendMessageToIframe } from './messaging-util';
import { getElementRectangle, hideOverlay, Rectangle, showOverlay } from './overlay';
import { getWebsiteIcon } from './webpage-icon-util';

/* global chrome */

window.addEventListener('message', async event => {
  if (event.data?.message === 'iframe message') {
    const messageType = event.data?.data?.type;
    if (messageType === 'inspect') {
      sendPostMessageResponse(event, await getDocumentTree(document));
    } else if (messageType === 'get element rectangle') {
      sendPostMessageResponse(event, await getRectangleBySelector(event.data?.data.selector));
    }
  }
});

/* eslint-disable @typescript-eslint/no-explicit-any */
function sendPostMessageResponse(event: MessageEvent<any>, responseMessage: any) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  event.source?.postMessage(
    {
      message: 'iframe message response',
      messageId: event.data.messageId,
      data: responseMessage,
    },
    event.origin,
  );
}

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
    } else if (request.message === 'clear highlight') {
      clearHighlights(request.type);
    } else if (request.message === 'get website icon') {
      getWebsiteIcon(document).then(info => {
        sendResponse(info);
      });
      return true;
    }
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
        try {
          const innerRect: Rectangle | undefined = await sendMessageToIframe(iframe, {
            type: 'get element rectangle',
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
        } catch (err) {
          console.error('Failed to get rectangle from iframe', err, iframe);
          return null;
        }
      }
    }
  }
}

function clearHighlights(type: 'click' | 'hover') {
  hideOverlay(type);
}
