/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/*
1. Each time the popup is opened, ask content-script.js to get
   form and form field data for the current page.
2. Call runAudits() to run the audits defined in audits.js.
3. Display form and form field data in popup.html.
*/

/* global chrome, runAudits */

let elementData;

const saveAsHTMLButton = document.querySelector('button');
saveAsHTMLButton.onclick = saveAsHTML;

const overviewDetails = document.querySelector('details#overview');
const overviewSummary = document.querySelector('#overview summary');

// Keys are used to order sections displayed in popup.
const ELEMENTS = {
  form: ['id', 'name', 'action', 'method'],
  input: ['id', 'name', 'autocomplete', 'placeholder', 'required', 'type'],
  select: ['id', 'name', 'autocomplete', 'required'],
  textarea: ['id', 'name', 'autocomplete', 'required'],
  button: ['id', 'name', 'textContent', 'type'],
  label: ['for', 'textContent'],
};

// Send a message to the content script to audit the current page.
// Need to do this every time the popup is opened.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: 'popup opened'} );
});

// Listen for a message from the content script that
// data has been stored for form and form field elements.
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    // console.log('message received in popup:', request.message);
    if (request.message === 'stored element data') {
      getElementData();
    }
  }
);

// Get the data about forms and form fields that has been stored by content-script.js.
function getElementData() {
  chrome.storage.local.get(['elementData'], (result) => {
    console.log('getElementData result:', result);
    elementData = result.elementData;
    // Now elementData is available, run the audits defined in audits.js.
    runAudits();
    let elementsNotFound = [];
    // Use ELEMENTS to choose display order.
    // Can't store a Map to share between content script and popup :(.
    for (const elementName in ELEMENTS) {
      const elementArray = elementData[elementName];
      // console.log(elementName, elementArray);
      if (elementArray.length > 0) {
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
  });
}

// Display information about an individual form or form field element, as stored by content-script.js.
function handleElementData(elementName, elementArray) {
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
function listElementsNotFound(elementsNotFound) {
  addElement(overviewDetails, 'div', `Element(s) not found: <code>${elementsNotFound.join('</code>, <code>')}</code>.`);
}

// Create a table to display the attribute values for form or form field elements.
// Headings are the attribute names appropriate for the current element.
// Each row represents an instance of the current element,
// i.e. a button, form, input, label, select or textarea.
// Each row displays the attribute values for an instance of an element.
function createAttributeTable(elementName, elementArray) {
  const table = document.createElement('table');
  let tr = document.createElement('tr');
  // Add a column heading for each attribute appropriate for the current element.
  for (const attributeName of ELEMENTS[elementName]) {
    addElement(tr, 'th', attributeName);
  }
  switch (elementName) {
  case 'for':
    addElement(tr, 'th', 'Field');
    break;
  default:
    break;
  }
  table.append(tr);
  for (const element of elementArray) {
    // For each instance of the current element...
    tr = document.createElement('tr');
    // ...display the attribute value.
    for (const attributeName of ELEMENTS[elementName]) {
      const attributeValue = element[attributeName] === null ? '—' :
        element[attributeName] === '' ? '[empty]' : element[attributeName];
      addElement(tr, 'td', attributeValue);
    }
    switch (elementName) {
    // Each for attribute should have an associated field.
    // The field id or name provided by content-script.js should match the for value.
    case 'for':
      addElement(tr, 'td', element.field);
      break;
    default:
      break;
    }
    table.appendChild(tr);
  }
  return table;
}

// Save results locally as an HTML file.
function saveAsHTML() {
  let headerHTML;
  chrome.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
      headerHTML = '<header><h1>Form audit<br>' +
        `<span style="font-weight: 400">${tabs[0].title}</span><br>` +
        `<span style="font-weight: 200">${tabs[0].url}</span></h1></header>`;
    });
  fetch('../css/popup.css')
    .then((response) => response.text())
    .then((text) => {
      const extras = 'body {margin: 40px;}\n' +
        'details {width: unset;}\n' +
        'footer, header, main {margin: 0 auto; max-width: 1000px;}' +
        'h1 {border-bottom: 2px solid #eee; font-size: 32px; margin: 0 0 60px 0; padding: 0 0 18px 0;}';
      const css = `<style>${text}\n${extras}</style>`;
      const mainHTML = `<main>${document.querySelector('main').innerHTML}</main>`;
      const footerHTML = `<footer>${document.querySelector('footer').innerHTML}</footer>`;
      const blob = new Blob([css, headerHTML, mainHTML, footerHTML], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: 'form-audit.html'
      });
    });
}

/* Utility functions */

function addElement(parent, elementName, html) {
  const el = document.createElement(elementName);
  el.innerHTML = html;
  parent.appendChild(el);
}

