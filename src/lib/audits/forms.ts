/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { findDescendants } from '../tree-util';

const FORM_FIELDS = ['button', 'input', 'select', 'textarea'];

/**
 * All form elements should contain at least one form field element.
 */
export function hasEmptyForms(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, ['form']);
  const emptyForms = eligibleFields.filter(form => findDescendants(form, FORM_FIELDS).length === 0);

  if (emptyForms.length) {
    return {
      auditType: 'form-empty',
      items: emptyForms,
      score: 1 - emptyForms.length / eligibleFields.length,
    };
  }
}

/**
 * Run all form audits.
 */
export const formAudits: AuditMetadata[] = [{ type: 'warning', weight: 1, audit: hasEmptyForms }];
