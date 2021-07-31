/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/* global chrome */

const IGNORE_CHILDREN = ['head', 'script', 'style', 'svg'];
const IGNORE_ATTRIBUTES = ['autofill-information', 'autofill-prediction'];

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
          getTree(document).then(tree => {
            chrome.storage.local.set({ tree: tree }, () => {
              chrome.runtime.sendMessage({ message: 'stored element data' });
            });
          });
        }
      });
    }
  } else {
    if (
      request.message === 'inspect' &&
      ((request.name === window.name && request.url === window.location.href) ||
        (request.name && request.name === window.name) || // in case the iframe gets redirected
        (request.url && request.url === window.location.href))
    ) {
      getTree(document).then(tree => {
        sendResponse(tree);
      });
      return true;
    }
  }

  if (request.message === 'highlight') {
    highlightElements(request.selector, request.className, request.scroll);
  } else if (request.message === 'clear highlight') {
    clearHighlights(request.className);
  }
});

/**
 * Gets a simplified/JSON serializable representation of the DOM tree
 * @param {Element} parent
 * @returns {TreeNode}
 */
async function getTree(parent) {
  const tree = {};
  const queue = [...parent.childNodes].map(child => ({
    element: child,
    node: tree,
  }));
  let item;

  while ((item = queue.shift())) {
    const node = {};

    if (item.element.nodeType === Node.TEXT_NODE && item.element.nodeValue.trim()) {
      node.text = item.element.nodeValue;
    } else if (item.element instanceof Element) {
      node.name = item.element.tagName.toLowerCase();
      const attributes = Array.from(item.element.attributes)
        .filter(a => !IGNORE_ATTRIBUTES.some(ignored => a.name === ignored))
        .map(a => [a.name, a.value]);
      if (attributes.length > 0) {
        node.attributes = Object.fromEntries(attributes);
      }
    } else {
      continue;
    }

    if (!item.node.children) {
      item.node.children = [];
    }
    item.node.children.push(node);

    // don't inspect the child nodes of ignored tags
    if (!IGNORE_CHILDREN.some(ignored => node.name === ignored)) {
      queue.push(
        ...[...item.element.childNodes].map(child => ({
          element: child,
          node,
        })),
      );
    }

    if (item.element.shadowRoot) {
      const shadowNode = {
        type: '#shadow-root',
        children: [],
      };
      if (!node.children) {
        node.children = [];
      }
      node.children.push(shadowNode);
      queue.push(
        ...[...item.element.shadowRoot.childNodes].map(child => ({
          element: child,
          node: shadowNode,
        })),
      );
    }

    if (item.element instanceof HTMLIFrameElement) {
      const iframeContent = await sendMessageAndWait({
        broadcast: true,
        wait: true,
        message: 'inspect',
        name: item.element.name,
        url: item.element.src,
      });
      const iframeNode = {
        type: '#document',
        children: [iframeContent],
      };
      if (!node.children) {
        node.children = [];
      }
      node.children.push(iframeNode);
    }
  }

  return tree;
}

/**
 * Gets all shadow roots in a document
 * @returns {ShadowRoot[]}
 */
function getShadowRoots() {
  const queue = [...document.children];
  const shadowRoots = [];
  let item;

  while ((item = queue.shift())) {
    queue.push(...item.children);

    if (item.shadowRoot) {
      queue.push(...item.shadowRoot.children);
      shadowRoots.push(item.shadowRoot);
    }
  }

  return shadowRoots;
}

function sendMessageAndWait(message, timeoutDuration = 500) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout duration exceeded'));
    }, timeoutDuration);
    chrome.runtime.sendMessage(message, response => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

function highlightElements(cssSelector, className, scroll) {
  clearHighlights(className);

  let currentRoot = document;
  let roots = cssSelector.split(' > #shadow-root > ');
  const selector = roots[roots.length - 1];
  roots = roots.slice(0, roots.length - 1);

  for (const root of roots) {
    const customElement = currentRoot.querySelector(root);
    if (customElement && customElement.shadowRoot) {
      currentRoot = customElement.shadowRoot;
      injectStylesheet(currentRoot, 'form-troubleshooter-highlight-css', chrome.runtime.getURL('css/highlight.css'));
    }
  }

  const elements = Array.from(currentRoot.querySelectorAll(selector));
  const firstElement = elements[0];
  if (firstElement && scroll) {
    firstElement.scrollIntoView({ behavior: 'smooth' });
  }

  elements.forEach(elem => {
    elem.classList.add(className);
  });
}

function clearHighlights(className) {
  const roots = [document, ...getShadowRoots()];
  roots.forEach(root => {
    Array.from(root.querySelectorAll(`.${className}`)).forEach(elem => {
      elem.classList.remove(className);
    });
  });
}

function injectStylesheet(target, id, url) {
  if (!target.querySelector(`#${id}`)) {
    var elem = document.createElement('link');
    elem.rel = 'stylesheet';
    elem.id = id;
    elem.setAttribute('href', url);
    target.appendChild(elem);
  }
}
