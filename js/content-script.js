/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/* global chrome */

// From https://html.spec.whatwg.org/multipage/forms.html. Added 'role'.
// 'autofill-information' and 'autofill-prediction' are for use with chrome://flags/#show-autofill-type-predictions.
// aria-* and data-* are handled in getInvalidAttributes().
const ATTRIBUTES = {
  'global': ['accesskey', 'autocapitalize', 'autofocus', 'autofill-information',
    'autofill-prediction', 'class', 'contenteditable', 'dir', 'draggable',
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
    if (request.message === 'popup opened') {
      getAndStoreElementData();
    }
  }
);

/**
 * Get data for form and form field elements, then store the data using chrome.storage.
 * Need to do this every time the extension popup is opened,
 * in case something in the page has been changed dynamically.
 * Once complete, send a response to the popup.
 */
function getAndStoreElementData() {
  chrome.storage.local.clear(() => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error('chrome.storage.local.clear() error in content-script.js:', error);
    } else {
      const elements = getAllDescendants(document);
      // Run this every time the popup is opened, in case page elements are updated dynamically.
      const elementData = {
        form: getElementInfo(elements, 'form', ['id', 'class', 'name', 'action', 'method', 'containsFormField']),
        input: getElementInfo(elements, 'input', ['id', 'class', 'name', 'autocomplete', 'placeholder', 'required', 'type']),
        select: getElementInfo(elements, 'select', ['id', 'class', 'name', 'autocomplete', 'required']),
        textarea: getElementInfo(elements, 'textarea', ['id', 'class', 'name', 'autocomplete', 'required']),
        button: getElementInfo(elements, 'button', ['id', 'class', 'name', 'textContent', 'type']),
        label: getElementInfo(elements, 'label', ['id', 'class', 'for', 'textContent', 'containsFormField', 'invalidLabelDescendants']),
      };
      chrome.storage.local.set({elementData: elementData}, () => {
        console.log('elementData', elementData);
        chrome.runtime.sendMessage({message: 'stored element data'});
      });
    }
  });
}

/**
 * Gets all DOM elements including elements in the shadow DOM
 * @param {Element} parent
 * @returns {Element[]}
 */
function getAllDescendants(parent) {
  /** @type {Element} */
  let element;
  const queue = [...parent.children];
  const descendants = [];

  while ((element = queue.shift())) {
    descendants.push(element);
    queue.push(...element.children);

    if (element.shadowRoot) {
      queue.push(...element.shadowRoot.children);
    }
  }

  return descendants;
}

/**
 * Get attribute (or textContent) values for all elements of a given name,
 * e.g. all input or label elements.
 *
 * @param {Element[]} allElements
 * @param {string} tagName
 * @param {string[]} properties
 * @returns {{ formAncestor?: HTMLFormElement, tagName: string, [key: string]: any }[]}
 */
function getElementInfo(allElements, tagName, properties) {
  const elementInfo = [];
  // Get all the elements with this elementName.
  const elements = allElements.filter(el => el.tagName.toLowerCase() === tagName.toLowerCase());
  for (const element of elements) {
    elementInfo.push(getElementProperties(element, properties));
  }
  return elementInfo;
}

/**
 * Get attribute values and other properties for a form or form field element.
 *
 * TODO: better way to add properties that are only used for one element, e.g. label.invalidLabelDescendants.
 *
 * @param {Element} element
 * @param {string[]} properties
 * @returns {{ formAncestor?: HTMLFormElement, tagName: string, [key: string]: any }}
 */
function getElementProperties(element, properties) {
  // Set properties used for all form and form field elements.
  let elementProperties = {
    // For form elements, formAncestor will be used to check for forms in forms (which is an error).
    // NB: closest() returns the element it's called on if that matches the selector.
    formAncestor: element.parentNode && element.parentNode.closest
      ? element.parentNode.closest('form')
        ? element.parentNode.closest('form').getAttribute('id')
        : null
      : null,
    tagName: element.tagName.toLowerCase(),
  };
  const invalidAttributes = getInvalidAttributes(element);
  if (invalidAttributes) {
    elementProperties.invalidAttributes = invalidAttributes;
  }
  // Add properties appropriate for specific elements, as defined in properties.
  for (const property of properties) {
    const descendants = getAllDescendants(element);

    switch (property) {
    case 'textContent':
      elementProperties.textContent = element.textContent.trim();
      break;
    case 'containsFormField':
      // Used for forms and labels.
      elementProperties.containsFormField = descendants.filter(filterByTags('button', 'input', 'select', 'textarea')).length > 0;
      break;
    case 'required':
      elementProperties.required = element.hasAttribute('required') ? 'required' : null;
      break;
    case 'invalidLabelDescendants':
      // Only used for labels.
      // eslint-disable-next-line no-case-declarations
      const invalidLabelDescendants = descendants.filter(filterByTags('a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'));
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

/**
 * Return a comma-separate list of invalid attributes for an element.
 *
 * @param {Element} element
 * @returns {string}
 */
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

/**
 * Builds a filter function to return elements by tag name
 * @param  {...string} tagsNames
 * @returns {(element: Element) => boolean}
 */
function filterByTags(...tagsNames) {
  const tags = tagsNames.map(t => t.toLowerCase());
  return (/** @type {Element} */ element) => tags.some(tag => element.tagName.toLowerCase() === tag);
}

// Get the HTML tags for an ancestor element, or return null if there is none.
// This is useful as a way to identity
// For example:
// • If an element is contained in a form, return the form tag.
// • If the element is not in a form, return null.
// function getAncestorTags(element, ancestorTagName) {
//   const ancestor = element.parentNode.closest(ancestorTagName);
//   return ancestor ? ancestor.outerHTML.replace(ancestor.innerHTML, '') : null;
// }