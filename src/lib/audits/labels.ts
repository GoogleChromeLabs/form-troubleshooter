/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from '../array-util';
import { closestParent, findDescendants, getTextContent } from '../tree-util';

const INPUT_SELECT_TEXT_FIELDS = ['input', 'select', 'textarea'];

/**
 * All labels have textContent (i.e. are not empty).
 */
export function hasEmptyLabel(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, ['label']).filter(node => !getTextContent(node));

  if (invalidFields.length) {
    issues.push({
      auditType: 'label-empty',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * In the same form, all label values are unique, i.e. no labels have duplicate textContent.
 */
export function hasUniqueLabels(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const labelsByForm = groupBy(
    findDescendants(tree, ['label'])
      .map(node => ({ ...node, context: { text: getTextContent(node) } }))
      .filter(field => field.context.text),
    node => closestParent(node, 'form'),
  );
  const duplicates = Array.from(labelsByForm.values())
    .map(formFields => Array.from(groupBy(formFields, field => field.context.text).values()))
    .filter(formFields => formFields.filter(fields => fields.length > 1).length)
    .flat();

  if (duplicates.length) {
    issues.push({
      auditType: 'label-unique',
      items: duplicates.map(fields => {
        const [first, ...others] = fields;
        return {
          ...first,
          context: {
            ...first.context,
            duplicates: others,
          },
        };
      }),
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Labels do not contain interactive elements or headings.
 * See https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns.
 */
export function hasLabelWithValidElements(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, ['label'])
    .map(node => ({
      ...node,
      context: { fields: findDescendants(node, ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) },
    }))
    .filter(field => field.context.fields.length);

  if (invalidFields.length) {
    issues.push({
      auditType: 'label-valid-elements',
      items: invalidFields,
      type: 'warning',
    });
  }

  return issues;
}

/**
 * All labels should have a for attribute.
 */
export function hasLabelWithForAttribute(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const fieldsByAria = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes['aria-labelledby']),
    node => node.attributes['aria-labelledby'],
  );
  const invalidFields = findDescendants(tree, ['label'])
    .filter(node => node.attributes.for == null)
    // Ignore labels that contain form fields: they don't need for attributes.
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#:~:text=nest
    .filter(node => findDescendants(node, ['button', 'input', 'select', 'textarea']).length === 0)
    .filter(node => !node.attributes.id || !fieldsByAria.has(node.attributes.id));

  if (invalidFields.length) {
    issues.push({
      auditType: 'label-for',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * No for attribute values are empty.
 */
export function hasLabelWithEmptyForAttribute(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, ['label']).filter(
    node => node.attributes.for != null && node.attributes.for.trim() === '',
  );

  if (invalidFields.length) {
    issues.push({
      auditType: 'label-for',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * All for attributes are unique.
 */
export function hasLabelWithUniqueForAttribute(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const labelsByFor = groupBy(
    findDescendants(tree, ['label']).filter(node => node.attributes.for),
    node => node.attributes.for,
  );
  const duplicates = Array.from(labelsByFor.values()).filter(fields => fields.length > 1);

  if (duplicates.length) {
    issues.push({
      auditType: 'label-unique',
      items: duplicates.map(fields => {
        const [first, ...others] = fields;
        return {
          ...first,
          context: {
            duplicates: others,
          },
        };
      }),
      type: 'error',
    });
  }

  return issues;
}

/**
 * All for attributes match the id of a form field.
 */
export function hasMatchingForLabel(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const inputsById = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const invalidFields = findDescendants(tree, ['label']).filter(
    node => node.attributes.for && !inputsById.has(node.attributes.for),
  );

  if (invalidFields.length) {
    issues.push({
      auditType: 'label-for',
      items: invalidFields,
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 */
export function runLabelAudits(tree: TreeNodeWithParent): AuditResult[] {
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