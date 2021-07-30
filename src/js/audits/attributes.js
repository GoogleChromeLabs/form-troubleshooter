/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from '../array-util';
import { ATTRIBUTES, FORM_FIELDS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { closestParent, findDescendants } from '../tree-util';
import { stringifyFormElementAsCode } from './audit-util';
import Fuse from 'fuse.js';

function getInvalidAttributes(element) {
  return Object.keys(element.attributes).filter(attributeName => {
    return (
      element.name &&
      !(
        ATTRIBUTES[element.name].includes(attributeName) ||
        ATTRIBUTES.global.includes(attributeName) ||
        attributeName.startsWith('aria-') ||
        attributeName.startsWith('data-') ||
        // Allow inline event handlers.
        attributeName.startsWith('on')
      )
    );
  });
}

/**
 * Form fields have valid attributes as defined in ATTRIBUTES.
 * @type {AuditHandler}
 */
export function hasInvalidAttributes(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, FORM_FIELDS)
    .map(node => ({ name: node.name, invalidAttributes: getInvalidAttributes(node) }))
    .filter(field => field.invalidAttributes.length);

  if (invalidFields.length) {
    const invalidFieldMessages = invalidFields.map(field => {
      const suggestions = new Fuse([...new Set([...ATTRIBUTES.global, ...(ATTRIBUTES[field.name] || [])])], {
        threshold: 0.2,
      });

      return `<code>${field.name}</code>: ${field.invalidAttributes
        .map(attribute => {
          let message = `<code>${attribute}</code>`;
          const matches = suggestions.search(attribute);
          const suggestion = matches[0] ? matches[0].item : null;
          if (suggestion) {
            message += ` (did you mean <code>${suggestion}</code>?)`;
          }
          return message;
        })
        .join(', ')}`;
    });
    issues.push({
      details:
        'Found element(s) with invalid attributes:<br>• ' +
        `${invalidFieldMessages.join('<br>• ')}` +
        '<br>Consider using <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes" title="MDN article: Using data attributes">data attributes</a> instead of non-standard attributes.',
      learnMore:
        'Learn more: <a href="https://html.spec.whatwg.org/multipage/forms.html" target="_blank">HTML Living Standard: Forms</a>',
      title: 'Element attributes should be valid.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form fields have either an id or a name attribute.
 * @type {AuditHandler}
 */
export function hasIdOrName(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
    .filter(node => node.attributes.type !== 'submit' && node.attributes.type !== 'file')
    .filter(node => !node.attributes.id && !node.attributes.name);

  if (invalidFields.length) {
    issues.push({
      details:
        'Found form field(s) with no <code>id</code> attribute and no <code>name</code> attribute:<br>• ' +
        `${invalidFields.map(node => stringifyFormElementAsCode(node)).join('<br>• ')}<br>(This may not be an error.)`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Element/input#htmlattrdefname" target="_blank">The HTML name attribute</a>',
      title: 'Form fields should have an <code>id</code> or a <code>name</code>.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Element id values are unique.
 * @type {AuditHandler}
 */
export function hasUniqueIds(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const fieldsById = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const duplicateFields = Array.from(fieldsById.values()).filter(values => values.length > 1);

  if (duplicateFields.length) {
    issues.push({
      details:
        'Found form fields with duplicate <code>id</code> attributes:<br>• ' +
        `${duplicateFields
          .map(fields => fields.map(field => stringifyFormElementAsCode(field)).join(', '))
          .join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://dequeuniversity.com/rules/axe/4.2/duplicate-id-active" target="_blank">ID attribute value must be unique</a>',
      title: 'Form fields must have unique <code>id</code> values.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Element name values within the same form are unique.
 * @type {AuditHandler}
 */
export function hasUniqueNames(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const fieldsByForm = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
      .filter(node => node.attributes.name)
      .filter(node => node.attributes.type !== 'radio' && node.attributes.type !== 'checkbox'),
    node => closestParent(node, 'form'),
  );
  const duplicates = Array.from(fieldsByForm.values())
    .map(formFields => Array.from(groupBy(formFields, field => field.attributes.name).values()))
    .filter(formFields => formFields.filter(fields => fields.length > 1).length)
    .flat();

  if (duplicates.length) {
    issues.push({
      details:
        'Found fields in the same form with duplicate <code>name</code> attributes:<br>• ' +
        `${duplicates.map(fields => fields.map(field => stringifyFormElementAsCode(field)).join(', ')).join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname" target="_blank">The input element name attribute</a>',
      title: 'Fields in the same form must have unique <code>name</code> values.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 * @type {AuditHandler}
 */
export function runAttributeAudits(tree) {
  return [...hasInvalidAttributes(tree), ...hasIdOrName(tree), ...hasUniqueIds(tree), ...hasUniqueNames(tree)];
}
