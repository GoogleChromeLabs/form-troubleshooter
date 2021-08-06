/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { INPUT_SELECT_TEXT_FIELDS, INPUT_TYPES } from '../constants';
import { closestParent, findDescendants } from '../tree-util';
import Fuse from 'fuse.js';
import { groupBy } from '../array-util';

/**
 * Input has a valid type value.
 */
export function hasValidInputType(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, ['input']);
  const invalidFields: TreeNodeWithContext<{ suggestion: string | null }>[] = eligibleFields.filter(
    node => node.attributes.type && !INPUT_TYPES.includes(node.attributes.type),
  );

  if (invalidFields.length) {
    const suggestions = new Fuse(INPUT_TYPES, { threshold: 0.3 });
    invalidFields.forEach(field => {
      const matches = suggestions.search(field.attributes.type);
      const suggestion = matches[0] ? matches[0].item : null;
      field.context = { suggestion };
    });
    return {
      auditType: 'input-type-valid',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

/**
 * Input has a label.
 */
export function inputHasLabel(tree: TreeNodeWithParent): AuditResult | undefined {
  const labels = findDescendants(tree, ['label']);
  const labelsById = groupBy(
    labels.filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const labelsByFor = groupBy(
    labels.filter(node => node.attributes.for),
    node => node.attributes.for,
  );
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.type !== 'hidden' && node.attributes.type !== 'button' && node.attributes.type !== 'submit',
  );
  const invalidFields = eligibleFields
    .filter(node => !closestParent(node, 'label'))
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
    return {
      auditType: 'input-label',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

export const inputAudits: AuditMetadata[] = [
  { type: 'error', weight: 5, audit: hasValidInputType },
  { type: 'error', weight: 3, audit: inputHasLabel },
];
