/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { findDescendants } from '../tree-util';

const FORM_FIELDS = ['button', 'input', 'select', 'textarea'];

/**
 * All form elements should contain at least one form field element.
 */
export function hasEmptyForms(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const emptyForms = findDescendants(tree, ['form']).filter(form => findDescendants(form, FORM_FIELDS).length === 0);

  if (emptyForms.length) {
    issues.push({
      auditType: 'form-empty',
      items: emptyForms,
      type: 'warning',
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
