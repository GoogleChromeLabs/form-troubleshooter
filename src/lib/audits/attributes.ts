/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from '../array-util';
import { ATTRIBUTES, FORM_FIELDS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { closestParent, findDescendants } from '../tree-util';
import Fuse from 'fuse.js';

function getInvalidAttributes(element: TreeNode) {
  return Object.keys(element.attributes!).filter(attributeName => {
    return (
      element.name &&
      !(
        ATTRIBUTES[element.name].includes(attributeName) ||
        ATTRIBUTES.global.includes(attributeName) ||
        attributeName.startsWith('aria-') ||
        attributeName.startsWith('data-') ||
        // Allow inline event handlers.
        attributeName.startsWith('on')
      )
    );
  });
}

/**
 * Form fields have valid attributes as defined in ATTRIBUTES.
 */
export function hasInvalidAttributes(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, FORM_FIELDS);
  const invalidFields = eligibleFields
    .map(node => {
      const contextNode: TreeNodeWithContext<ContextInvalidAttributes> = node;
      // mutating node instead of returning a new one to keep object identity the same
      contextNode.context = {
        invalidAttributes: getInvalidAttributes(node).map(attribute => {
          const suggestions = new Fuse(Array.from(new Set([...ATTRIBUTES.global, ...(ATTRIBUTES[node.name!] || [])])), {
            threshold: 0.2,
          });
          const matches = suggestions.search(attribute);
          const suggestion = matches[0] ? matches[0].item : null;
          return { attribute, suggestion };
        }),
      };
      return contextNode;
    })
    .filter(field => field.context?.invalidAttributes.length);

  if (invalidFields.length) {
    return {
      auditType: 'invalid-attributes',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

/**
 * Form fields have either an id or a name attribute.
 */
export function hasIdOrName(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.type !== 'button' && node.attributes.type !== 'submit' && node.attributes.type !== 'file',
  );
  const invalidFields = eligibleFields.filter(node => !node.attributes.id && !node.attributes.name);

  if (invalidFields.length) {
    return {
      auditType: 'missing-identifier',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

/**
 * Element id values are unique.
 */
export function hasUniqueIds(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes.id);
  const fieldsById = groupBy(eligibleFields, node => node.attributes.id);
  const duplicates = Array.from(fieldsById.values()).filter(values => values.length > 1);

  if (duplicates.length) {
    return {
      auditType: 'unique-ids',
      items: duplicates.map(fields => {
        const [first, ...others] = fields as TreeNodeWithContext<ContextDuplicates>[];
        // mutating node instead of returning a new one to keep object identity the same
        first.context = {
          duplicates: others,
        };
        return first;
      }),
      score: 1 - duplicates.reduce((total, fields) => total + fields.length, 0) / eligibleFields.length,
    };
  }
}

/**
 * Element name values within the same form are unique.
 */
export function hasUniqueNames(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
    .filter(node => node.attributes.name)
    .filter(node => node.attributes.type !== 'radio' && node.attributes.type !== 'checkbox');
  const fieldsByForm = groupBy(eligibleFields, node => closestParent(node, 'form'));
  const duplicates = Array.from(fieldsByForm.values())
    .map(formFields => Array.from(groupBy(formFields, field => field.attributes.name).values()))
    .filter(formFields => formFields.filter(fields => fields.length > 1).length)
    .flat();

  if (duplicates.length) {
    return {
      auditType: 'unique-names',
      items: duplicates.map(fields => {
        const [first, ...others] = fields as TreeNodeWithContext<ContextDuplicates>[];
        // mutating node instead of returning a new one to keep object identity the same
        first.context = {
          duplicates: others,
        };
        return first;
      }),
      score: 1 - duplicates.reduce((total, fields) => total + fields.length, 0) / eligibleFields.length,
    };
  }
}

export const attributeAudits: AuditMetadata[] = [
  { type: 'warning', weight: 1, audit: hasInvalidAttributes },
  { type: 'warning', weight: 1, audit: hasIdOrName },
  { type: 'error', weight: 1, audit: hasUniqueIds },
  { type: 'warning', weight: 1, audit: hasUniqueNames },
];
