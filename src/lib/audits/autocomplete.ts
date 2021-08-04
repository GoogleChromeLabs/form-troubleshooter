/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { AUTOCOMPLETE_ALIASES, AUTOCOMPLETE_TOKENS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { findDescendants } from '../tree-util';
import { createLinkableElement } from './audit-util';
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
      details:
        'Found form field(s) with no <code>autocomplete</code> attribute, ' +
        'even though an appropriate value is available:<br>• ' +
        `${invalidFields.map(field => createLinkableElement(field)).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://web.dev/sign-in-form-best-practices/#autofill" target="_blank">Help users to avoid re-entering data</a>',
      items: invalidFields,
      references: [
        {
          title: 'Help users to avoid re-entering data',
          url: 'https://web.dev/sign-in-form-best-practices/#autofill',
        },
      ],
      title: 'Form fields should use autocomplete where possible.',
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
      details:
        'Found form field(s) with empty autocomplete values:<br>• ' +
        `${invalidFields.map(field => createLinkableElement(field)).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values" target="_blank">The HTML autocomplete attribute: Values</a>',
      items: invalidFields,
      references: [
        {
          title: 'The HTML autocomplete attribute: Values',
          url: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values',
        },
      ],
      title: 'Autocomplete values must not be empty.',
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
      details:
        'Found form field(s) with <code>autocomplete="off"</code>:<br>• ' +
        `${invalidFields
          .map(field => createLinkableElement(field))
          .join('<br>• ')}<br>Although <code>autocomplete="off"</code> is
          <a href="https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-off"
          title="HTML spec autocomplete attribute information">valid HTML</a> and has legitimate use
          cases, it can be problematic for users (forcing them to reenter data) and may not work as
          expected (such as with autofill behaviour in name, address and payment forms).`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values" target="_blank">The HTML autocomplete attribute: Values</a>',
      items: invalidFields,
      references: [
        {
          title: 'The HTML autocomplete attribute: Values',
          url: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values',
        },
      ],
      title: 'Consider avoiding autocomplete="off".',
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
  const invalidFieldMessages = [];
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
        let message = createLinkableElement(field, token);

        if (suggestion) {
          if (AUTOCOMPLETE_ALIASES[suggestion]) {
            suggestion = AUTOCOMPLETE_ALIASES[suggestion];
          }
          message += `, did you mean <code>${suggestion}</code>?`;
        }

        invalidFields.push({ ...field, context: { suggestion } });
        invalidFieldMessages.push(message);
      }
    }
  }

  if (invalidFieldMessages.length) {
    issues.push({
      auditType: 'autocomplete-valid',
      details:
        'Found form field(s) with invalid <code>autocomplete</code> values:<br>• ' +
        `${invalidFieldMessages.join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete" target="_blank">The HTML autocomplete attribute</a>',
      items: invalidFields,
      references: [
        {
          title: 'The HTML autocomplete attribute',
          url: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete',
        },
      ],
      title: 'Autocomplete values must be valid.',
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
