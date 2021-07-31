/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { INPUT_SELECT_TEXT_FIELDS, INPUT_TYPES } from '../constants';
import { closestParent, findDescendants } from '../tree-util';
import { createLinkableElement } from './audit-util';
import Fuse from 'fuse.js';
import { groupBy } from '../array-util';

/**
 * Input has a valid type value.
 * @type {AuditHandler}
 */
export function hasValidInputType(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, ['input']).filter(
    node => node.attributes.type && !INPUT_TYPES.includes(node.attributes.type),
  );

  if (invalidFields.length) {
    const suggestions = new Fuse(INPUT_TYPES, { threshold: 0.3 });
    const messages = invalidFields.map(field => {
      const matches = suggestions.search(field.attributes.type);
      const suggestion = matches[0] ? matches[0].item : null;
      let message = createLinkableElement(field);

      if (suggestion) {
        message += `, did you mean <code>${suggestion}</code>?`;
      }

      return message;
    });
    issues.push({
      details: `Found input field(s) with invalid types:<br>• ${messages.join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types" target="_blank">MDN: The Input (Form Input) element</a>.',
      title: 'Inputs types should be valid.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Input has a label.
 * @type {AuditHandler}
 */
export function inputHasLabel(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const labelsByFor = groupBy(
    findDescendants(tree, ['label']).filter(node => node.attributes.for),
    node => node.attributes.for,
  );
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
    .filter(node => !closestParent(node, 'label'))
    .filter(node => !labelsByFor.has(node.attributes.id));

  if (invalidFields.length) {
    issues.push({
      details: `Found input field(s) without a corresponding label:<br>• ${invalidFields
        .map(field => createLinkableElement(field))
        .join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label" target="_blank">MDN: Labels</a>.',
      title: 'Input fields should have labels.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Run all input audits.
 * @type {AuditHandler}
 */
export function runInputAudits(tree) {
  return [...hasValidInputType(tree), ...inputHasLabel(tree)];
}
