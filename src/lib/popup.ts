/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from './array-util';
import { runAudits } from './audits';
import { ELEMENTS } from './constants';
import { findDescendants, getPath, getTextContent, getTreeNodeWithParents, pathToQuerySelector } from './tree-util';

/*
1. Each time the popup is opened, ask content-script.js to get
   form and form field data for the current page.
2. Call runAudits() to run the audits defined in audits.js.
3. Display form and form field data in popup.html.
*/

/* global chrome */

const saveAsHTMLButton = document.querySelector('button')!;
saveAsHTMLButton.onclick = saveAsHTML;

const overviewDetails = document.querySelector('details#overview')!;
const overviewSummary = document.querySelector('#overview summary')!;

let tabId: number;

// Send a message to the content script to audit the current page.
// Need to do this every time the popup is opened.
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  tabId = tabs[0].id!;
  chrome.tabs.sendMessage(tabId, { message: 'popup opened' });

  window.addEventListener('blur', () => {
    clearHighlight('form-troubleshooter-highlight');
    clearHighlight('form-troubleshooter-highlight-hover');
  });
});

function showHighlight(selector: string, className: string, scrollIntoView: boolean) {
  chrome.tabs.sendMessage(tabId, { message: 'highlight', selector, className, scroll: scrollIntoView });
}

function clearHighlight(className: string) {
  chrome.tabs.sendMessage(tabId, { message: 'clear highlight', className });
}

// Listen for a message from the content script that
// data has been stored for form and form field elements.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log('message received in popup:', request.message);
  if (request.message === 'stored element data') {
    processFormData();
  }
});

document.addEventListener('click', event => {
  const selector = getSelector(event.target as Element);
  if (selector) {
    showHighlight(selector, 'form-troubleshooter-highlight', true);
  }
});

let hoverPath: string | null;
document.addEventListener('mousemove', event => {
  if (hoverPath) {
    // clear highlight
    const selector = getSelector(event.target as Element);
    if (!selector) {
      hoverPath = null;
      clearHighlight('form-troubleshooter-highlight-hover');
    } else {
      hoverPath = selector;
      showHighlight(selector, 'form-troubleshooter-highlight-hover', false);
    }
  } else {
    // add highlight
    const selector = getSelector(event.target as Element);
    if (selector) {
      hoverPath = selector;
      showHighlight(selector, 'form-troubleshooter-highlight-hover', false);
    }
  }
});

document.addEventListener('mouseleave', event => {
  const selector = getSelector(event.target as Element);
  if (selector) {
    clearHighlight('form-troubleshooter-highlight-hover');
  }
});

function getSelector(el: Element) {
  if (el.closest) {
    const anchor = el.closest('.highlight-element');
    if (anchor) {
      const path = anchor.getAttribute('data-path');

      if (path) {
        return pathToQuerySelector(path);
      }
    }
  }
  return null;
}

// Get the data about forms and form fields that has been stored by content-script.js
// then display a summary, run audits, and display any audit issues found.
function processFormData() {
  chrome.storage.local.get(['tree'], result => {
    const tree = getTreeNodeWithParents(result.tree);

    // Display a summary of forms and form fields.
    displaySummary(tree);

    // Run the audits defined in audits.js and display results.
    const auditIssues = runAudits(tree);
    displayAuditIssues(auditIssues.results);
  });
}

function displaySummary(tree: TreeNodeWithParent) {
  const elementsNotFound: string[] = [];
  const elementsByType = groupBy(
    findDescendants(tree, Object.keys(ELEMENTS)).filter(node => node.name),
    node => node.name,
  );

  // Use ELEMENTS to choose display order.
  // Can't store a Map to share between content script and popup :(.
  for (const elementName in ELEMENTS) {
    const elementArray = elementsByType.get(elementName);
    // const elementArray = elementData[elementName];
    // console.log(elementName, elementArray);
    if (elementArray && elementArray.length > 0) {
      // Display data about an individual form or form field element.
      handleElementData(elementName, elementArray);
    } else {
      // To display a list of elements that weren't found on the page.
      elementsNotFound.push(elementName);
    }
  }

  // If no form or form field elemens were found...
  if (elementsNotFound.length === Object.keys(ELEMENTS).length) {
    overviewSummary.classList.add('inactive');
    overviewSummary.textContent = 'No form or form field elements found.';
  }

  // If at least one form or form field element was found...
  if (elementsNotFound.length < Object.keys(ELEMENTS).length) {
    overviewSummary.textContent = 'Overview of form and form field elements';
  }
  if (elementsNotFound.length > 0) {
    listElementsNotFound(elementsNotFound);
  }
}

// Display information about an individual form or form field element, as stored by content-script.js.
function handleElementData(elementName: string, elementArray: TreeNodeWithParent[]) {
  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.textContent = elementName;
  if (elementArray.length > 1) {
    h2.textContent += `s: ${elementArray.length}`;
  }
  section.appendChild(h2);
  const table = createAttributeTable(elementName, elementArray);
  section.appendChild(table);
  overviewDetails.appendChild(section);
}

// Display a list of names for form or form field elements not found on the current page.
function listElementsNotFound(elementsNotFound: string[]) {
  addElement(overviewDetails, 'div', `Element(s) not found: <code>${elementsNotFound.join('</code>, <code>')}</code>.`);
}

// Create a table to display the attribute values for form or form field elements.
// Headings are the attribute names appropriate for the current element.
// Each row represents an instance of the current element,
// i.e. a button, form, input, label, select or textarea.
// Each row displays the attribute values for an instance of an element.
function createAttributeTable(elementName: string, elementArray: TreeNodeWithParent[]) {
  const table = document.createElement('table');
  let tr = document.createElement('tr');
  // Add a column heading for each attribute appropriate for the current element.
  for (const attributeName of ELEMENTS[elementName]) {
    addElement(tr, 'th', attributeName);
  }
  table.append(tr);
  for (const element of elementArray) {
    // For each instance of the current element...
    tr = document.createElement('tr');
    const path = getPath(element);
    if (path) {
      tr.className = 'highlight-element';
      tr.setAttribute('data-path', path);
    }
    // ...display the attribute value.
    const attributes = element.attributes;
    for (const attributeName of ELEMENTS[elementName]) {
      let attributeValue = attributes[attributeName];
      if (attributeValue == null) {
        if (attributeName === 'textContent') {
          attributeValue = getTextContent(element);
        } else {
          attributeValue = '-';
        }
      } else if (!attributeValue) {
        if (attributeName === 'required') {
          attributeValue = 'true';
        } else {
          attributeValue = '[empty]';
        }
      }

      addElement(tr, 'td', attributeValue);
    }
    table.appendChild(tr);
  }
  return table;
}

// In popup.html, display errors and warnings for any issues found by runAudits().
// Each of the items represents a single issue with an element or attribute.
function displayAuditIssues(items: AuditResult[]) {
  const numErrors = items.filter(item => item.type === 'error').length;
  const numWarnings = items.filter(item => item.type === 'warning').length;
  for (const item of items) {
    displayAuditIssue(item);
  }
  if (numErrors > 0) {
    const summary = document.querySelector('details#error summary')!;
    summary.classList.remove('inactive');
    summary.textContent = `${numErrors} error`;
    if (numErrors > 1) {
      summary.textContent += 's';
    }
  }
  if (numWarnings > 0) {
    const summary = document.querySelector('details#warning summary')!;
    summary.classList.remove('inactive');
    summary.textContent = `${numWarnings} warning`;
    if (numWarnings > 1) {
      summary.textContent += 's';
    }
  }
}

// Add a warning or an error to popup.html.
function displayAuditIssue(item: AuditResult) {
  // details will be details#error or details#warning
  const details = document.getElementById(item.type)!;
  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.innerHTML = 'item.title';
  section.appendChild(h2);
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('details');
  detailsDiv.innerHTML = 'item.details';
  section.appendChild(detailsDiv);
  const learnMoreDiv = document.createElement('div');
  learnMoreDiv.classList.add('learn-more');
  learnMoreDiv.innerHTML = 'item.learnMore';
  section.appendChild(learnMoreDiv);
  details.appendChild(section);
}

// Save results locally as an HTML file.
function saveAsHTML() {
  let headerHTML: string;
  chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    headerHTML =
      '<header><h1>Form audit<br>' +
      `<span style="font-weight: 400">${tabs[0].title}</span><br>` +
      `<span style="font-weight: 200">${tabs[0].url}</span></h1></header>`;
  });
  fetch('../css/popup.css')
    .then(response => response.text())
    .then(text => {
      const extras =
        'body {margin: 40px;}\n' +
        'details {width: unset;}\n' +
        'footer, header, main {margin: 0 auto; max-width: 1000px;}' +
        'h1 {border-bottom: 2px solid #eee; font-size: 32px; margin: 0 0 60px 0; ' +
        'overflow: hidden; padding: 0 0 18px 0; text-overflow: ellipsis; white-space: nowrap}';
      const css = `<style>${text}\n${extras}</style>`;
      const mainHTML = `<main>${document.querySelector('main')?.innerHTML}</main>`;
      const footerHTML = `<footer>${document.querySelector('footer')?.innerHTML}</footer>`;
      const blob = new Blob([css, headerHTML, mainHTML, footerHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url,
        filename: 'form-audit.html',
      });
    });
}

/* Utility functions */

function addElement(parent: Element, elementName: string, html: string) {
  const el = document.createElement(elementName);
  el.innerHTML = html;
  parent.appendChild(el);
}
