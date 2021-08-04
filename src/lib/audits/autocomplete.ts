/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { AUTOCOMPLETE_ALIASES, AUTOCOMPLETE_TOKENS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { findDescendants } from '../tree-util';
import Fuse from 'fuse.js';

/**
 * Form fields have autocomplete attributes when appropriate.
 * Empty autocomplete are handled in hasEmptyAutocomplete().
 */
export function hasAutocompleteAttributes(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node =>
      !node.attributes.autocomplete &&
      node.attributes.type !== 'hidden' &&
      (AUTOCOMPLETE_TOKENS.includes(node.attributes.id) || AUTOCOMPLETE_TOKENS.includes(node.attributes.name)),
  );

  if (invalidFields.length) {
    issues.push({
      auditType: 'autocomplete-attribute',
      items: invalidFields,
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form fields do not have autocomplete with empty value.
 */
export function hasEmptyAutocomplete(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.autocomplete != null && node.attributes.autocomplete.trim() === '',
  );

  if (invalidFields.length) {
    issues.push({
      auditType: 'autocomplete-empty',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * Form fields do not have autocomplete with value 'off'.
 */
export function hasAutocompleteOff(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.autocomplete && node.attributes.autocomplete.trim() === 'off',
  );

  if (invalidFields.length) {
    issues.push({
      auditType: 'autocomplete-off',
      items: invalidFields,
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form autocomplete atttribute values are valid.
 */
export function hasValidAutocomplete(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const fields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS);
  const invalidFields: TreeNodeWithContext<{ suggestion: string | null }>[] = [];
  const autocompleteSuggestions = new Fuse([...AUTOCOMPLETE_TOKENS, ...Object.keys(AUTOCOMPLETE_ALIASES)], {
    threshold: 0.3,
  });

  for (const field of fields) {
    const attributes = field.attributes;
    // fields missing autocomplete, autocomplete="", and autocomplete="off" are handled elsewhere.
    if (!attributes.autocomplete || attributes.autocomplete === 'off') {
      continue;
    }
    // autocomplete attributes may include multiple tokens, e.g. autocomplete="shipping postal-code".
    // section-* is also allowed.
    // The test here is only for valid tokens: token order isn't checked.
    for (const token of attributes.autocomplete.split(' ').filter(Boolean)) {
      if (!AUTOCOMPLETE_TOKENS.includes(token) && !token.startsWith('section-')) {
        const matches = autocompleteSuggestions.search(token);
        let suggestion = matches[0] ? matches[0].item : null;

        if (suggestion) {
          if (AUTOCOMPLETE_ALIASES[suggestion]) {
            suggestion = AUTOCOMPLETE_ALIASES[suggestion];
          }
        }

        invalidFields.push({ ...field, context: { suggestion } });
      }
    }
  }

  if (invalidFields.length) {
    issues.push({
      auditType: 'autocomplete-valid',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 */
export function runAutocompleteAudits(tree: TreeNodeWithParent): AuditResult[] {
  return [
    ...hasAutocompleteAttributes(tree),
    ...hasEmptyAutocomplete(tree),
    ...hasAutocompleteOff(tree),
    ...hasValidAutocomplete(tree),
  ];
}
