/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getTextContent } from '../tree-util';

const FORM_ATTRIBUTES_TO_INCLUDE = ['action', 'autocomplete', 'class', 'for', 'id', 'name', 'placeholder', 'type'];
const END_TAGS_TO_INCLUDE = new Set(['label', 'button']);

/**
 * Create a representation of a form element.
 */
export function stringifyFormElement(node: TreeNodeWithParent, additionalAttributes: string[] = []): string {
  const attributes = Object.entries(node.attributes)
    .filter(entry => [...FORM_ATTRIBUTES_TO_INCLUDE, ...additionalAttributes].includes(entry[0]))
    // Include empty attributes, e.g. for="", but not missing attributes.
    .filter(entry => node.attributes[entry[0]] !== null);
  const attributesString = attributes
    .map(([name, value]) => {
      return `${name}="${value}"`;
    })
    .join(' ');

  const hasHiddenAttributes = Object.entries(node.attributes).length > attributes.length;
  let str = `<${node.name}${attributesString ? ` ${attributesString}` : ''}${hasHiddenAttributes ? ' ...' : ''}>`;
  if (END_TAGS_TO_INCLUDE.has(node.name!)) {
    const textContent = getTextContent(node);
    str += `${textContent}</${node.name}>`;
  }

  return str;
}
