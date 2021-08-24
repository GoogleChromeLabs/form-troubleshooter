/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { getBareTreeNode, getPath, getTextContent } from '../tree-util';

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
      if (!value) {
        return name;
      }
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

export function makeAuditDetailsSerializable(auditDetails: AuditDetails): SerializableAuditDetails {
  return {
    score: auditDetails.score,
    errors: auditDetails.errors.map(result => ({
      ...result,
      items: result.items.map(item => ({ ...getBareTreeNode(item, false), path: getPath(item) })),
    })),
    warnings: auditDetails.warnings.map(result => ({
      ...result,
      items: result.items.map(item => ({ ...getBareTreeNode(item, false), path: getPath(item) })),
    })),
  };
}
