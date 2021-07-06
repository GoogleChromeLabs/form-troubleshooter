/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/* global chrome */

// From https://html.spec.whatwg.org/multipage/forms.html. Added 'role'.
// Also aria-* and data-*
const ATTRIBUTES = {
  'global': ['accesskey', 'autocapitalize', 'autofocus', 'class', 'contenteditable', 'dir', 'draggable',
    'enterkeyhint', 'hidden', 'inputmode', 'is', 'id', 'itemid', 'itemprop', 'itemref', 'itemscope',
    'itemtype', 'lang', 'nonce', 'role', 'spellcheck', 'style', 'tabindex', 'title', 'translate'],
  'button': ['disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate',
    'formtarget', 'name', 'type', 'value'],
  'form': ['accept-charset', 'action', 'autocomplete', 'enctype', 'method', 'name', 'novalidate',
    'target', 'rel'],
  // autocorrect for Safari
  'input': ['accept', 'alt', 'autocomplete', 'autocorrect', 'checked', 'dirname', 'disabled',
    'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'height',
    'list', 'max', 'maxlength', 'min', 'minlength', 'multiple', 'name', 'pattern', 'placeholder',
    'readonly', 'required', 'size', 'src', 'step', 'type', 'value', 'width', 'title'],
  'label': ['for'],
  'select': ['autocomplete', 'disabled', 'form', 'multiple', 'name', 'required', 'size'],
  'textarea': ['autocomplete', 'cols', 'dirname', 'disabled', 'form', 'maxlength', 'minlength',
    'name', 'placeholder', 'readonly', 'required', 'rows', 'wrap']
};

// Listen for a message from the popup that it has been opened.
// Need to re-run the audits here every time the popup is opened.
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    // console.log('message received in content-script:', request.message);
    if (request.message === 'popup opened') {
      getAndStoreElementData();
    }
  }
);

// Get data for form and form field elements, then store the data using chrome.storage.
// Need to do this every time the extension popup is opened,
// in case something in the page has been changed dynamically.
// Once complete, send a response to the popup.
function getAndStoreElementData() {
  chrome.storage.local.clear(() => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error('chrome.storage.local.clear() error in content-script.js:', error);
    } else {
      // Run this every time the popup is opened, in case page elements are updated dynamically.
      const elementData = {
        form: getElementInfo('form', ['id', 'class', 'name', 'action', 'method', 'containsFormField']),
        input: getElementInfo('input', ['id', 'class', 'name', 'autocomplete', 'placeholder', 'required', 'type']),
        select: getElementInfo('select', ['id', 'class', 'name', 'autocomplete', 'required']),
        textarea: getElementInfo('textarea', ['id', 'class', 'name', 'autocomplete', 'required']),
        button: getElementInfo('button', ['id', 'class', 'name', 'textContent', 'type']),
        label: getElementInfo('label', ['id', 'class', 'for', 'textContent', 'containsFormField', 'invalidLabelDescendants']),
      };
      chrome.storage.local.set({elementData: elementData}, () => {
        console.log('elementData', elementData);
        chrome.runtime.sendMessage({message: 'stored element data'});
      });
    }
  });
}

// Get attribute (or textContent) values for all elements of a given name,
// e.g. all input or label elements.
function getElementInfo(tagName, properties) {
  const elementInfo = [];
  // Get all the elements with this elementName.
  const elements = [...document.getElementsByTagName(tagName)];
  for (const element of elements) {
    elementInfo.push(getElementProperties(element, properties));
  }
  return elementInfo;
}

// Get attribute values and other properties for a form or form field element.
// TODO: better way to add properties that are only used for one element, e.g. label.invalidLabelDescendants.
function getElementProperties(element, properties) {
  // Set properties used for all form and form field element.
  let elementProperties = {
    // For form elements, formAncestorID will be used to check for forms in forms (which is an error).
    // NB: closest() returns the element it's called on if that matches the selector.
    formAncestorID: element.parentNode.closest('form') ?
      element.parentNode.closest('form').getAttribute('id') : null,
    tagName: element.tagName.toLowerCase(),
  };
  const invalidAttributes = getInvalidAttributes(element);
  if (invalidAttributes) {
    elementProperties.invalidAttributes = invalidAttributes;
  }
  // Add properties appropriate for specific elements, as defined in properties.
  for (const property of properties) {
    switch (property) {
    case 'textContent':
      elementProperties.textContent = element.textContent.trim();
      break;
    case 'containsFormField':
      // Used for forms and labels.
      elementProperties.containsFormField =
        element.querySelector('button, input, select, textarea') !== null;
      break;
    case 'required':
      elementProperties.required = element.hasAttribute('required') ? 'required' : null;
      break;
    case 'invalidLabelDescendants':
      // Only used for labels.
      // eslint-disable-next-line no-case-declarations
      const invalidLabelDescendants = [...element.querySelectorAll('a, button, h1, h2, h3, h4, h5, h6')];
      elementProperties.invalidLabelDescendants =
        invalidLabelDescendants.map(node => node.nodeName.toLowerCase()).join(', ');
      break;
    default:
      elementProperties[property] = element.hasAttribute(property) ?
        element.getAttribute(property) : null;
    }
  }
  return elementProperties;
}

// Return a comma-separate list of invalid attributes for an element.
function getInvalidAttributes(element) {
  return [...element.attributes]
    .map(attribute => attribute.name)
    .filter(attributeName => {
      return !(ATTRIBUTES[element.tagName.toLowerCase()].includes(attributeName) ||
      ATTRIBUTES.global.includes(attributeName) ||
      attributeName.startsWith('aria-') ||
      attributeName.startsWith('data-') ||
      // Allow inline event handlers.
      attributeName.startsWith('on'));
    })
    .join(', ');
}
