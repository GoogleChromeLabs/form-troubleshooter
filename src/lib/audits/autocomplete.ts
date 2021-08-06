/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { AUTOCOMPLETE_ALIASES, AUTOCOMPLETE_TOKENS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { findDescendants } from '../tree-util';
import Fuse from 'fuse.js';

/**
 * Form fields have autocomplete attributes when appropriate.
 * Empty autocomplete are handled in hasEmptyAutocomplete().
 */
export function hasAutocompleteAttributes(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.type !== 'hidden' && node.attributes.type !== 'button' && node.attributes.type !== 'submit',
  );
  const invalidFields = eligibleFields.filter(
    node =>
      !node.attributes.autocomplete &&
      (AUTOCOMPLETE_TOKENS.includes(node.attributes.id) || AUTOCOMPLETE_TOKENS.includes(node.attributes.name)),
  );

  if (invalidFields.length) {
    return {
      auditType: 'autocomplete-attribute',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

/**
 * Form fields do not have autocomplete with empty value.
 */
export function hasEmptyAutocomplete(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.type !== 'hidden' && node.attributes.type !== 'button' && node.attributes.type !== 'submit',
  );
  const invalidFields = eligibleFields.filter(
    node => node.attributes.autocomplete != null && node.attributes.autocomplete.trim() === '',
  );

  if (invalidFields.length) {
    return {
      auditType: 'autocomplete-empty',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

/**
 * Form fields do not have autocomplete with value 'off'.
 */
export function hasAutocompleteOff(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.type !== 'hidden' && node.attributes.type !== 'button' && node.attributes.type !== 'submit',
  );
  const invalidFields = eligibleFields.filter(
    node => node.attributes.autocomplete && node.attributes.autocomplete.trim() === 'off',
  );

  if (invalidFields.length) {
    return {
      auditType: 'autocomplete-off',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

/**
 * Form autocomplete atttribute values are valid.
 */
export function hasValidAutocomplete(tree: TreeNodeWithParent): AuditResult | undefined {
  const eligibleFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.type !== 'hidden' && node.attributes.type !== 'button' && node.attributes.type !== 'submit',
  );
  const invalidFields: TreeNodeWithContext<{ token: string | null; suggestion: string | null }>[] = [];
  const autocompleteSuggestions = new Fuse([...AUTOCOMPLETE_TOKENS, ...Object.keys(AUTOCOMPLETE_ALIASES)], {
    threshold: 0.3,
  });

  for (const field of eligibleFields) {
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

        invalidFields.push({ ...field, context: { token, suggestion } });
      }
    }
  }

  if (invalidFields.length) {
    return {
      auditType: 'autocomplete-valid',
      items: invalidFields,
      score: 1 - invalidFields.length / eligibleFields.length,
    };
  }
}

export const autocompleteAudits: AuditMetadata[] = [
  { type: 'warning', weight: 1, audit: hasAutocompleteAttributes },
  { type: 'warning', weight: 1, audit: hasEmptyAutocomplete },
  { type: 'warning', weight: 1, audit: hasAutocompleteOff },
  { type: 'error', weight: 5, audit: hasValidAutocomplete },
];
