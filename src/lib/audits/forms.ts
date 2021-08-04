/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { findDescendants } from '../tree-util';
import { createLinkableElement } from './audit-util';

const FORM_FIELDS = ['button', 'input', 'select', 'textarea'];

/**
 * All form elements should contain at least one form field element.
 */
export function hasEmptyForms(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const emptyForms = findDescendants(tree, ['form']).filter(form => findDescendants(form, FORM_FIELDS).length === 0);

  if (emptyForms.length) {
    issues.push({
      details:
        'Found form(s) not containing any form fields:<br>• ' +
        `${emptyForms.map(form => createLinkableElement(form)).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form" target="_blank">MDN: The HTML form element</a>.',
      items: emptyForms,
      references: [
        {
          title: 'MDN: The HTML form element',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form',
        },
      ],
      title: 'Forms should contain form fields.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Run all form audits.
 */
export function runFormAudits(tree: TreeNodeWithParent): AuditResult[] {
  return [...hasEmptyForms(tree)];
}
