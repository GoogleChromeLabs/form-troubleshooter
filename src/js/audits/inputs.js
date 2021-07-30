/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { INPUT_TYPES } from '../constants';
import { findDescendants } from '../tree-util';
import { stringifyFormElementAsCode } from './audit-util';
import Fuse from 'fuse.js';

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
      let message = stringifyFormElementAsCode(field);

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
 * Run all input audits.
 * @type {AuditHandler}
 */
export function runInputAudits(tree) {
  return [...hasValidInputType(tree)];
}
