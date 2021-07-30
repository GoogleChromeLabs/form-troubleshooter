/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import {groupBy} from '../array-util';
import {closestParent, findDescendants, getTextContent} from '../tree-util';
import {stringifyFormElementAsCode, wrapInCode} from './audit-util';

const INPUT_SELECT_TEXT_FIELDS = ['input', 'select', 'textarea'];

/**
 * All labels have textContent (i.e. are not empty).
 * @type {AuditHandler}
 */
export function hasEmptyLabel(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, ['label']).filter(node => !getTextContent(node));

  if (invalidFields.length) {
    issues.push({
      details: `Found empty label(s):<br>• ${invalidFields.map(field => stringifyFormElementAsCode(field)).join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://equalizedigital.com/accessibility-checker/empty-missing-form-label" target="_blank">Empty or Missing Form Label</a>',
      title: 'Labels must have text content.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * In the same form, all label values are unique, i.e. no labels have duplicate textContent.
 * @type {AuditHandler}
 */
export function hasUniqueLabels(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const labelsByForm = groupBy(
    findDescendants(tree, ['label'])
      .map(node => ({label: node, text: getTextContent(node)}))
      .filter(field => field.text),
    node => closestParent(node.label, 'form'),
  );
  const duplicates = Array.from(labelsByForm.values())
    .map(formFields => Array.from(groupBy(formFields, field => field.text).values()))
    .filter(formFields => formFields.filter(fields => fields.length > 1).length)
    .flat();

  if (duplicates.length) {
    issues.push({
      details: 'Found labels in the same form with duplicate values:<br>• ' +
        `${duplicates.map(fields => fields.map(field => stringifyFormElementAsCode(field.label)).join(', ')).join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://equalizedigital.com/accessibility-checker/duplicate-form-label/" target="_blank">Duplicate Form Labels</a>',
      title: 'Labels in the same form should have unique values.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Labels do not contain interactive elements or headings.
 * See https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns.
 * @type {AuditHandler}
 */
export function hasLabelWithValidElements(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, ['label'])
    .map(node => ({label: node, invalid: findDescendants(node, ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])}))
    .filter(field => field.invalid.length);

  if (invalidFields.length) {
    issues.push({
      details: 'Found label(s) containing a heading or interactive element:<br>• ' +
        `${invalidFields.map(field => `${stringifyFormElementAsCode(field.label)} contains the element ${field.invalid.map(invalid => wrapInCode(invalid.name)).join(', ')}.`).join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns" target="_blank">Label element: Accessibility concerns</a>',
      title: 'Don\'t put headings or interactive elements in labels.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * All labels should have a for attribute.
 * @type {AuditHandler}
 */
export function hasLabelWithForAttribute(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, ['label'])
    // eslint-disable-next-line eqeqeq
    .filter(node => node.attributes.for == null)
    // Ignore labels that contain form fields: they don't need for attributes.
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#:~:text=nest
    .filter(node => findDescendants(node, ['button', 'input', 'select', 'textarea']).length === 0);

  if (invalidFields.length) {
    issues.push({
      details: 'Found label(s) with no form field descendant, and with no <code>for</code> attribute:<br>• ' +
        `${invalidFields.map(node => stringifyFormElementAsCode(node)).join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/for#usage" target="_blank">The HTML for attribute</a>',
      title: 'Labels must have a for attribute or contain a form field.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * No for attribute values are empty.
 * @type {AuditHandler}
 */
export function hasLabelWithEmptyForAttribute(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const invalidFields = findDescendants(tree, ['label'])
    // eslint-disable-next-line eqeqeq
    .filter(node => node.attributes.for != null && node.attributes.for.trim() === '');

  if (invalidFields.length) {
    issues.push({
      details: 'Found label(s) with an empty <code>for</code> attribute:<br>• ' +
        `${invalidFields.map(field => stringifyFormElementAsCode(field)).join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/for#usage" target="_blank">The HTML for attribute</a>',
      title: 'The for attribute of a label must not be empty.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * All for attributes are unique.
 * @type {AuditHandler}
 */
export function hasLabelWithUniqueForAttribute(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const labelsByFor = groupBy(findDescendants(tree, ['label'])
    .filter(node => node.attributes.for), node => node.attributes.for);
  const duplicates = Array.from(labelsByFor.values()).filter(fields => fields.length > 1);

  if (duplicates.length) {
    issues.push({
      details: 'Found labels with the same <code>for</code> attribute:<br>• ' +
        duplicates.map(fields => fields.map(field => stringifyFormElementAsCode(field)).join(', ')).join('<br>• '),
      learnMore: 'Learn more: <a href="https://equalizedigital.com/accessibility-checker/duplicate-form-label/" target="_blank">Duplicate Form Label</a>',
      title: 'The for attribute of a label must be unique.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * All for attributes match the id of a form field.
 * @type {AuditHandler}
 */
export function hasMatchingForLabel(tree) {
  /** @type {AuditResult[]} */
  const issues = [];
  const inputsById = groupBy(findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes.id), node => node.attributes.id);
  const invalidFields = findDescendants(tree, ['label']).filter(node => node.attributes.for && !inputsById.has(node.attributes.for));

  if (invalidFields.length) {
    issues.push({
      details: 'The <code>for</code> attribute of the following label(s) does not match the id ' +
        `of a form field:<br>• ${invalidFields.map(field => stringifyFormElementAsCode(field)).join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/for#usage" target="_blank">The HTML for attribute</a>',
      title: 'The for attribute of a label must match the id of a form field.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 * @type {AuditHandler}
 */
export function runLabelAudits(tree) {
  return [
    ...hasEmptyLabel(tree),
    ...hasUniqueLabels(tree),
    ...hasLabelWithValidElements(tree),
    ...hasLabelWithForAttribute(tree),
    ...hasLabelWithEmptyForAttribute(tree),
    ...hasLabelWithUniqueForAttribute(tree),
    ...hasMatchingForLabel(tree),
  ];
}
