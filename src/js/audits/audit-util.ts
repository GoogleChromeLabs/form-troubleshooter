/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getPath, getTextContent } from '../tree-util';

const FORM_ATTRIBUTES_TO_INCLUDE = ['action', 'autocomplete', 'class', 'for', 'id', 'name', 'placeholder', 'type'];
const END_TAGS_TO_INCLUDE = new Set(['label']);

/**
 * Escapes a string as HTML.
 * Note that this isn't complete and other characters should be added as required.
 */
export function escapeHtml(html: string): string {
  return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Create a representation of a form element.
 */
export function stringifyFormElement(node: TreeNodeWithParent): string {
  const attributes = Object.entries(node.attributes)
    .filter(entry => FORM_ATTRIBUTES_TO_INCLUDE.includes(entry[0]))
    // Include empty attributes, e.g. for="", but not missing attributes.
    .filter(entry => node.attributes[entry[0]] !== null);
  const attributesString = attributes
    .map(([name, value]) => {
      return `${name}="${value}"`;
    })
    .join(' ');

  const hasHiddenAttributes = Object.entries(node.attributes).length > attributes.length;
  let str = `<${node.name}${attributesString ? ` ${attributesString}` : ''}${hasHiddenAttributes ? ' ...' : ''}>`;
  const textContent = getTextContent(node);
  if (textContent || END_TAGS_TO_INCLUDE.has(node.name!)) {
    str += `${textContent}</${node.name}>`;
  }

  return str;
}

/**
 * Escapes and wraps a string in `code`.
 * @param {string} str
 * @param {string} highlight Part of the code to draw attention to
 */
export function wrapInCode(str: string, highlight: string | undefined = undefined): string {
  let value = escapeHtml(str);
  if (highlight) {
    value = value.replace(highlight, `</code><strong><code>${highlight}</code></strong><code>`);
  }
  return `<code>${value}</code>`;
}

/**
 * Create a representation of a form element wrapping it in `code`.
 * @param {TreeNodeWithParent} node
 * @param {string} highlight Part of the code to draw attention to
 */
export function stringifyFormElementAsCode(
  node: TreeNodeWithParent,
  highlight: string | undefined = undefined,
): string {
  return wrapInCode(stringifyFormElement(node), highlight);
}

/**
 * Create an anchor tag that can be used to highlight elements.
 * @param {TreeNodeWithParent} node
 * @param {string} highlight Part of the code to draw attention to
 */
export function createLinkableElement(node: TreeNodeWithParent, highlight: string | undefined = undefined): string {
  const path = getPath(node);
  const content = stringifyFormElementAsCode(node, highlight);
  if (path) {
    return `<a class="highlight-element" data-path="${path}">${content}</a>`;
  }
  return content;
}
