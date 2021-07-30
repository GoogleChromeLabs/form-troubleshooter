/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { AUTOCOMPLETE_TOKENS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { findDescendants } from '../tree-util';
import { stringifyFormElementAsCode } from './audit-util';
import Fuse from 'fuse.js';

/**
 * Form fields have autocomplete attributes when appropriate.
 * Empty autocomplete are handled in hasEmptyAutocomplete().
 * @type {AuditHandler}
 */
export function hasAutocompleteAttributes(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node =>
      !node.attributes.autocomplete &&
      node.attributes.type !== 'hidden' &&
      (AUTOCOMPLETE_TOKENS.includes(node.attributes.id) || AUTOCOMPLETE_TOKENS.includes(node.attributes.name)),
  );

  if (invalidFields.length) {
    issues.push({
      details:
        'Found form field(s) with no <code>autocomplete</code> attribute, ' +
        'even though an appropriate value is available:<br>• ' +
        `${invalidFields.map(field => stringifyFormElementAsCode(field)).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://web.dev/sign-in-form-best-practices/#autofill" target="_blank">Help users to avoid re-entering data</a>',
      title: 'Form fields should use autocomplete where possible.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form fields do not have autocomplete with empty value.
 * @type {AuditHandler}
 */
export function hasEmptyAutocomplete(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.autocomplete != null && node.attributes.autocomplete.trim() === '',
  );

  if (invalidFields.length) {
    issues.push({
      details:
        'Found form field(s) with empty autocomplete values:<br>• ' +
        `${invalidFields.map(field => stringifyFormElementAsCode(field)).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values" target="_blank">The HTML autocomplete attribute: Values</a>',
      title: 'Autocomplete values must not be empty.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Form fields do not have autocomplete with value 'off'.
 * @type {AuditHandler}
 */
export function hasAutocompleteOff(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    node => node.attributes.autocomplete && node.attributes.autocomplete.trim() === 'off',
  );

  if (invalidFields.length) {
    issues.push({
      details:
        'Found form field(s) with <code>autocomplete="off"</code>:<br>• ' +
        `${invalidFields
          .map(field => stringifyFormElementAsCode(field))
          .join('<br>• ')}<br>Although <code>autocomplete="off"</code> is
          <a href="https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-off"
          title="HTML spec autocomplete attribute information">valid HTML</a>, most browsers ignore
          it: setting <code>autocomplete="off"</code> does not disable autofill.`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values" target="_blank">The HTML autocomplete attribute: Values</a>',
      title: 'Form fields should not use autocomplete="off".',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form autocomplete atttribute values are valid.
 * @type {AuditHandler}
 */
export function hasValidAutocomplete(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const fields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS);
  const invalidFieldMessages = [];
  const autocompleteSuggestions = new Fuse(AUTOCOMPLETE_TOKENS, { threshold: 0.3 });

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
        const suggestion = matches[0] ? matches[0].item : null;
        let message = stringifyFormElementAsCode(field);

        if (suggestion) {
          message += `, did you mean <code>${suggestion}</code> (instead of <code>${token}</code>)?`;
        }

        invalidFieldMessages.push(message);
      }
    }
  }

  if (invalidFieldMessages.length) {
    issues.push({
      details:
        'Found form field(s) with invalid <code>autocomplete</code> values:<br>• ' +
        `${invalidFieldMessages.join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete" target="_blank">The HTML autocomplete attribute</a>',
      title: 'Autocomplete values must be valid.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 * @type {AuditHandler}
 */
export function runAutocompleteAudits(tree) {
  return [
    ...hasAutocompleteAttributes(tree),
    ...hasEmptyAutocomplete(tree),
    ...hasAutocompleteOff(tree),
    ...hasValidAutocomplete(tree),
  ];
}
