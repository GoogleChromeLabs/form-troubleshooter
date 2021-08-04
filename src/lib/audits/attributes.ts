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
export function hasInvalidAttributes(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, FORM_FIELDS)
    .map(node => ({
      ...node,
      context: {
        invalidAttributes: getInvalidAttributes(node).map(attribute => {
          const suggestions = new Fuse(Array.from(new Set([...ATTRIBUTES.global, ...(ATTRIBUTES[node.name!] || [])])), {
            threshold: 0.2,
          });
          const matches = suggestions.search(attribute);
          const suggestion = matches[0] ? matches[0].item : null;
          return { attribute, suggestion };
        }),
      },
    }))
    .filter(field => field.context.invalidAttributes.length);

  if (invalidFields.length) {
    issues.push({
      auditType: 'invalid-attributes',
      items: invalidFields,
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form fields have either an id or a name attribute.
 */
export function hasIdOrName(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
    .filter(node => node.attributes.type !== 'submit' && node.attributes.type !== 'file')
    .filter(node => !node.attributes.id && !node.attributes.name);

  if (invalidFields.length) {
    issues.push({
      auditType: 'missing-identifier',
      items: invalidFields,
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Element id values are unique.
 */
export function hasUniqueIds(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const fieldsById = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const duplicateFields = Array.from(fieldsById.values()).filter(values => values.length > 1);

  if (duplicateFields.length) {
    issues.push({
      auditType: 'unique-ids',
      items: duplicateFields.map(fields => {
        const [first, ...others] = fields;
        return {
          ...first,
          context: {
            duplicates: others,
          },
        };
      }),
      type: 'error',
    });
  }

  return issues;
}

/**
 * Element name values within the same form are unique.
 */
export function hasUniqueNames(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const fieldsByForm = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
      .filter(node => node.attributes.name)
      .filter(node => node.attributes.type !== 'radio' && node.attributes.type !== 'checkbox'),
    node => closestParent(node, 'form'),
  );
  const duplicates = Array.from(fieldsByForm.values())
    .map(formFields => Array.from(groupBy(formFields, field => field.attributes.name).values()))
    .filter(formFields => formFields.filter(fields => fields.length > 1).length)
    .flat();

  if (duplicates.length) {
    issues.push({
      auditType: 'unique-names',
      items: duplicates.map(fields => {
        const [first, ...others] = fields;
        return {
          ...first,
          context: {
            duplicates: others,
          },
        };
      }),
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 */
export function runAttributeAudits(tree: TreeNodeWithParent): AuditResult[] {
  return [...hasInvalidAttributes(tree), ...hasIdOrName(tree), ...hasUniqueIds(tree), ...hasUniqueNames(tree)];
}
