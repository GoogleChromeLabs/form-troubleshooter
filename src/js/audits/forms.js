/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { findDescendants } from '../tree-util';
import { createLinkableElement } from './audit-util';

const FORM_FIELDS = ['button', 'input', 'select', 'textarea'];

/**
 * All form elements should contain at least one form field element.
 * @type {AuditHandler}
 */
export function hasEmptyForms(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const emptyForms = findDescendants(tree, ['form']).filter(form => findDescendants(form, FORM_FIELDS).length === 0);

  if (emptyForms.length) {
    issues.push({
      details:
        'Found form(s) not containing any form fields:<br>• ' +
        `${emptyForms.map(form => createLinkableElement(form)).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form" target="_blank">MDN: The HTML form element</a>.',
      title: 'Forms should contain form fields.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Run all form audits.
 * @type {AuditHandler}
 */
export function runFormAudits(tree) {
  return [...hasEmptyForms(tree)];
}
