/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

/* global chrome */

// Listen for a message from the popup that it has been opened.
// Need to re-run the audits here every time the popup is opened.
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.message === 'dom inspected') {
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
  chrome.storage.local.get('tree', data => {
    const tree = getTreeNodeWithParents(data.tree);
    const elementData = {
      form: getElementInfo(tree, 'form', ['id', 'class', 'name', 'action', 'method', 'containsFormField']),
      input: getElementInfo(tree, 'input', ['id', 'class', 'name', 'autocomplete', 'placeholder', 'required', 'type']),
      select: getElementInfo(tree, 'select', ['id', 'class', 'name', 'autocomplete', 'required']),
      textarea: getElementInfo(tree, 'textarea', ['id', 'class', 'name', 'autocomplete', 'required']),
      button: getElementInfo(tree, 'button', ['id', 'class', 'name', 'textContent', 'type']),
      label: getElementInfo(tree, 'label', ['id', 'class', 'for', 'textContent', 'containsFormField', 'invalidLabelDescendants']),
    };
    chrome.storage.local.set({elementData: elementData}, () => {
      console.log('elementData', elementData);
      chrome.runtime.sendMessage({message: 'stored element data'});
    });
  });
}

/**
 * Form element properties
 * @typedef {{ formAncestorID?: string, tagName: string, attributes: [key: string]: any }} ElementProperties
 */

/**
 * Get attribute (or textContent) values for all elements of a given name,
 * e.g. all input or label elements.
 *
 * @param {TreeNodeWithParent} tree
 * @param {string} tagName
 * @param {string[]} properties
 * @returns {ElementProperties[]}
 */
function getElementInfo(tree, tagName, properties) {
  const elementInfo = [];
  // Get all the nodes with this tagName.
  const nodes = findDescendants(tree, [tagName]);

  for (const node of nodes) {
    elementInfo.push(getElementProperties(node, properties));
  }
  return elementInfo;
}

/**
 * TreeNode which has been extended to include it's parent node
 * @typedef {{TreeNode & {parent?: TreeNodeWithParent, children: TreeNodeWithParent[], attributes: {[key: string]: string}}}} TreeNodeWithParent
 */

/**
 * Copies a tree, adding parent relationships
 *
 * @param {TreeNode} parent
 * @returns {TreeNodeWithParent}
 */
function getTreeNodeWithParents(parent) {
  const root = Object.assign({attributes: {}}, parent);
  const queue = [root];
  let item;

  while ((item = queue.shift())) {
    if (item.children) {
      item.children = item.children.map(c => (Object.assign({attributes: {}}, c, {parent: item})));
      queue.push(...item.children);
    } else {
      item.children = [];
    }
  }

  return root;
}

/**
 * Finds descendants of a given node by tagName
 *
 * @param {TreeNode} parent
 * @param {string[]} tagNames
 * @returns {TreeNodeWithParent[]}
 */
function findDescendants(parent, tagNames) {
  const queue = [...(parent.children || [])];
  const results = [];
  let item;

  while ((item = queue.shift())) {
    if (tagNames.some(t => t === item.name)) {
      results.push(item);
    }
    if (item.children) {
      queue.push(...item.children);
    }
  }

  return results;
}

/**
 * Gets text content recursively for a given node
 *
 * @param {TreeNode} parent
 * @returns {string}
 */
function getTextContent(parent) {
  const queue = [...(parent.children || [])];
  const results = [];
  let item;

  while ((item = queue.shift())) {
    if (item.text) {
      results.push(item.text);
    }
    if (item.children) {
      queue.unshift(...item.children);
    }
  }

  return results.join(' ');
}

/**
 * Searches for the closest parent node with the matching tagName
 *
 * @param {TreeNodeWithParent} node
 * @param {string} tagName
 * @returns {TreeNodeWithParent}
 */
function closestParent(node, tagName) {
  let currentNode = node;
  while ((currentNode = currentNode.parent)) {
    if (tagName === currentNode.name) {
      return currentNode;
    }
  }
}

/**
 * Get attribute values and other properties for a form or form field element.
 *
 * TODO: better way to add properties that are only used for one element, e.g. label.invalidLabelDescendants.
 *
 * @param {TreeNodeWithParent} node
 * @param {string[]} properties
 * @returns {ElementProperties}
 */
function getElementProperties(node, properties) {
  let form = closestParent(node, 'form');
  // Set properties used for all form and form field elements.
  let elementProperties = {
    // For form elements, formAncestor will be used to check for forms in forms (which is an error).
    formAncestorID: form ? form.id : null,
    tagName: node.name,
    attributes: node.attributes,
  };
  // Add properties appropriate for specific elements, as defined in properties.
  for (const property of properties) {
    switch (property) {
    case 'textContent': {
      const text = getTextContent(node);
      if (text) {
        elementProperties.textContent = getTextContent(node);
      }
      break;
    }
    case 'containsFormField': {
      // Used for forms and labels.
      elementProperties.containsFormField = findDescendants(node, ['button', 'input', 'select', 'textarea']).length > 0;
      break;
    }
    case 'required': {
      elementProperties.required = node.attributes.required !== undefined;
      break;
    }
    case 'invalidLabelDescendants': {
      // Only used for labels.
      // eslint-disable-next-line no-case-declarations
      const invalidLabelDescendants = findDescendants(node, ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
      elementProperties.invalidLabelDescendants =
        invalidLabelDescendants.map(item => item.name).join(', ');
      break;
    }
    default:
      break;
    }
  }
  return elementProperties;
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