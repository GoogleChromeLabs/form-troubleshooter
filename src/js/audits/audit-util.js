/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import {getTextContent} from '../tree-util';

const FORM_ATTRIBUTES_TO_INCLUDE = ['action', 'autocomplete', 'class', 'for', 'id', 'name', 'placeholder'];
const END_TAGS_TO_INCLUDE = new Set(['label']);

function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Create a representation of a form element.
 * @param {TreeNodeWithParent} node
 * @returns {string}
 */
export function stringifyFormElement(node) {
  let attributes = Object.entries(node.attributes)
    .filter(entry => FORM_ATTRIBUTES_TO_INCLUDE.includes(entry[0]))
    // Include empty attributes, e.g. for="", but not missing attributes.
    .filter(entry => node[entry[0]] !== null)
    .map(([name, value]) => {
      return `${name}="${value}"`;
    })
    .join(' ');
  let str = `<${node.name}${attributes ? ' ' + attributes : ''}>`;
  const textContent = getTextContent(node);
  if (textContent || END_TAGS_TO_INCLUDE.has(node.name)) {
    str += `${textContent}</${node.name}>`;
  }

  return str;
}

/**
 * Escapes and wraps a string in `code`.
 * @param {string} str
 * @returns {string}
 */
export function wrapInCode(str) {
  return `<code>${escapeHtml(str)}</code>`;
}

/**
 * Create a representation of a form element wrapping it in `code`.
 * @param {TreeNodeWithParent} node
 * @returns {string}
 */
export function stringifyFormElementAsCode(node) {
  return wrapInCode(stringifyFormElement(node));
}
