/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { INPUT_SELECT_TEXT_FIELDS, INPUT_TYPES } from '../constants';
import { closestParent, findDescendants } from '../tree-util';
import Fuse from 'fuse.js';
import { groupBy } from '../array-util';

/**
 * Input has a valid type value.
 */
export function hasValidInputType(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields: TreeNodeWithContext<{ suggestion: string | null }>[] = findDescendants(tree, ['input']).filter(
    node => node.attributes.type && !INPUT_TYPES.includes(node.attributes.type),
  );

  if (invalidFields.length) {
    const suggestions = new Fuse(INPUT_TYPES, { threshold: 0.3 });
    invalidFields.forEach(field => {
      const matches = suggestions.search(field.attributes.type);
      const suggestion = matches[0] ? matches[0].item : null;
      field.context = { suggestion };
    });
    issues.push({
      auditType: 'input-type-valid',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * Input has a label.
 */
export function inputHasLabel(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const labels = findDescendants(tree, ['label']);
  const labelsById = groupBy(
    labels.filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const labelsByFor = groupBy(
    labels.filter(node => node.attributes.for),
    node => node.attributes.for,
  );
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
    .filter(node => !closestParent(node, 'label'))
    .filter(node => node.attributes.type !== 'button' && node.attributes.type !== 'submit')
    .map(node => ({ ...node, context: { reasons: [] as Array<{ type: string; reference: string }> } }))
    .filter(node => {
      if (node.attributes.id) {
        node.context.reasons.push({ type: 'id', reference: node.attributes.id });
      }
      return !labelsByFor.has(node.attributes.id);
    })
    .filter(node => {
      if (node.attributes['aria-labelledby']) {
        node.context.reasons.push({ type: 'aria-labelledby', reference: node.attributes['aria-labelledby'] });
      }
      return (
        !node.attributes['aria-labelledby'] ||
        !node.attributes['aria-labelledby']
          .split(' ')
          .filter(Boolean)
          .some(id => labelsById.has(id))
      );
    });

  if (invalidFields.length) {
    issues.push({
      auditType: 'input-label',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * Run all input audits.
 */
export function runInputAudits(tree: TreeNodeWithParent): AuditResult[] {
  return [...hasValidInputType(tree), ...inputHasLabel(tree)];
}
