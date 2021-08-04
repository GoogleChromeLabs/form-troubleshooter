/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from '../array-util';
import { ATTRIBUTES, FORM_FIELDS, INPUT_SELECT_TEXT_FIELDS } from '../constants';
import { closestParent, findDescendants } from '../tree-util';
import { createLinkableElement } from './audit-util';
import Fuse from 'fuse.js';

function getInvalidAttributes(element: TreeNode) {
  return Object.keys(element.attributes!).filter(attributeName => {
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
 */
export function hasInvalidAttributes(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, FORM_FIELDS)
    .map(node => ({
      ...node,
      context: {
        invalidAttributes: getInvalidAttributes(node).map(attribute => {
          const suggestions = new Fuse(Array.from(new Set([...ATTRIBUTES.global, ...(ATTRIBUTES[node.name!] || [])])), {
            threshold: 0.2,
          });
          const matches = suggestions.search(attribute);
          const suggestion = matches[0] ? matches[0].item : null;
          return { attribute, suggestion };
        }),
      },
    }))
    .filter(field => field.context.invalidAttributes.length);

  if (invalidFields.length) {
    const invalidFieldMessages = invalidFields.map(field => {
      return `${createLinkableElement(field)}: ${field.context.invalidAttributes
        .map(({ attribute, suggestion }) => {
          let message = `<strong><code>${attribute}</code></strong>`;
          if (suggestion) {
            message += ` (did you mean <code>${suggestion}</code>?)`;
          }
          return message;
        })
        .join('<br>&nbsp;&nbsp;&nbsp;')}`;
    });
    issues.push({
      auditType: 'invalid-attributes',
      details:
        'Found element(s) with invalid attributes:<br>• ' +
        `${invalidFieldMessages.join('<br>• ')}` +
        '<br>Consider using <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes" title="MDN article: Using data attributes">data attributes</a> instead of non-standard attributes.',
      learnMore:
        'Learn more: <a href="https://html.spec.whatwg.org/multipage/forms.html" target="_blank">HTML Living Standard: Forms</a>',
      items: invalidFields,
      references: [
        {
          title: 'HTML Living Standard: Forms',
          url: 'https://html.spec.whatwg.org/multipage/forms.html',
        },
      ],
      title: 'Element attributes should be valid.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Form fields have either an id or a name attribute.
 */
export function hasIdOrName(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const invalidFields = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS)
    .filter(node => node.attributes.type !== 'submit' && node.attributes.type !== 'file')
    .filter(node => !node.attributes.id && !node.attributes.name);

  if (invalidFields.length) {
    issues.push({
      auditType: 'missing-identifier',
      details:
        'Found form field(s) with no <code>id</code> attribute and no <code>name</code> attribute:<br>• ' +
        `${invalidFields.map(node => createLinkableElement(node)).join('<br>• ')}<br>(This may not be an error.)`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Element/input#htmlattrdefname" target="_blank">The HTML name attribute</a>',
      items: invalidFields,
      references: [
        {
          title: 'The HTML name attribute',
          url: 'https://developer.mozilla.org/docs/Web/HTML/Element/input#htmlattrdefname',
        },
      ],
      title: 'Form fields should have an <code>id</code> or a <code>name</code>.',
      type: 'warning',
    });
  }

  return issues;
}

/**
 * Element id values are unique.
 */
export function hasUniqueIds(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
  const fieldsById = groupBy(
    findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const duplicateFields = Array.from(fieldsById.values()).filter(values => values.length > 1);

  if (duplicateFields.length) {
    issues.push({
      auditType: 'unique-ids',
      details:
        'Found form fields with duplicate <code>id</code> attributes:<br>• ' +
        `${duplicateFields
          .map(fields => fields.map(field => createLinkableElement(field)).join('<br>&nbsp;&nbsp;&nbsp;'))
          .join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://dequeuniversity.com/rules/axe/4.2/duplicate-id-active" target="_blank">ID attribute value must be unique</a>',
      items: duplicateFields.map(fields => {
        const [first, ...others] = fields;
        return {
          ...first,
          context: {
            duplicates: others,
          },
        };
      }),
      references: [
        {
          title: 'ID attribute value must be unique',
          url: 'https://dequeuniversity.com/rules/axe/4.2/duplicate-id-active',
        },
      ],
      title: 'Form fields must have unique <code>id</code> values.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Element name values within the same form are unique.
 */
export function hasUniqueNames(tree: TreeNodeWithParent): AuditResult[] {
  const issues: AuditResult[] = [];
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
      auditType: 'unique-names',
      details:
        'Found fields in the same form with duplicate <code>name</code> attributes:<br>• ' +
        `${duplicates
          .map(fields => fields.map(field => createLinkableElement(field)).join('<br>&nbsp;&nbsp;&nbsp;'))
          .join('<br>• ')}`,
      learnMore:
        'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname" target="_blank">The input element name attribute</a>',
      items: duplicates.map(fields => {
        const [first, ...others] = fields;
        return {
          ...first,
          context: {
            duplicates: others,
          },
        };
      }),
      references: [
        {
          title: 'The input element name attribute',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname',
        },
      ],
      title: 'Fields in the same form must have unique <code>name</code> values.',
      type: 'error',
    });
  }

  return issues;
}

/**
 * Rull all attribute audits.
 */
export function runAttributeAudits(tree: TreeNodeWithParent): AuditResult[] {
  return [...hasInvalidAttributes(tree), ...hasIdOrName(tree), ...hasUniqueIds(tree), ...hasUniqueNames(tree)];
}
