/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { groupBy } from '../array-util';
import { closestParent, findDescendants, getTextContent } from '../tree-util';

const INPUT_SELECT_TEXT_FIELDS = ['input', 'select', 'textarea'];

/**
 * All labels have textContent (i.e. are not empty).
 */
export function hasEmptyLabel(tree: TreeNodeWithParent): AuditResult | undefined {
  const invalidFields = findDescendants(tree, ['label']).filter(node => !getTextContent(node));

  if (invalidFields.length) {
    return {
      auditType: 'label-empty',
      items: invalidFields,
    };
  }
}

/**
 * In the same form, all label values are unique, i.e. no labels have duplicate textContent.
 */
export function hasUniqueLabels(tree: TreeNodeWithParent): AuditResult | undefined {
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
    return {
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
    };
  }
}

/**
 * Labels do not contain interactive elements or headings.
 * See https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns.
 */
export function hasLabelWithValidElements(tree: TreeNodeWithParent): AuditResult | undefined {
  const invalidFields = findDescendants(tree, ['label'])
    .map(node => ({
      ...node,
      context: { fields: findDescendants(node, ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) },
    }))
    .filter(field => field.context.fields.length);

  if (invalidFields.length) {
    return {
      auditType: 'label-valid-elements',
      items: invalidFields,
    };
  }
}

/**
 * All for attributes are unique.
 */
export function hasLabelWithUniqueForAttribute(tree: TreeNodeWithParent): AuditResult | undefined {
  const labelsByFor = groupBy(
    findDescendants(tree, ['label']).filter(node => node.attributes.for),
    node => node.attributes.for,
  );
  const duplicates = Array.from(labelsByFor.values()).filter(fields => fields.length > 1);

  if (duplicates.length) {
    return {
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
    };
  }
}

/**
 * Label has associated input
 */
export function hasInput(tree: TreeNodeWithParent): AuditResult | undefined {
  const inputs = findDescendants(tree, INPUT_SELECT_TEXT_FIELDS).filter(
    input => input.attributes.type !== 'button' && input.attributes.type !== 'submit',
  );
  const inputsById = groupBy(
    inputs.filter(node => node.attributes.id),
    node => node.attributes.id,
  );
  const inputsByAria = groupBy(
    inputs
      .filter(node => node.attributes['aria-labelledby'])
      .flatMap(node =>
        node.attributes['aria-labelledby']
          .split(' ')
          .filter(Boolean)
          .map(id => ({ ariaId: id, node })),
      ),
    item => item.ariaId,
    item => item.node,
  );
  const labels = findDescendants(tree, ['label']);

  const invalidFields = labels
    .map(node => ({ ...node, context: { reasons: [] as Array<{ type: string; reference: string }> } }))
    .filter(node => {
      const emptyFor = node.attributes.for != null && node.attributes.for.trim() === '';
      const invalidFor = node.attributes.for && !inputsById.has(node.attributes.for);
      const invalidAria =
        !inputsById.has(node.attributes.for) && node.attributes.id && !inputsByAria.has(node.attributes.id);
      const invalidChild =
        !node.attributes.for &&
        !node.attributes.id &&
        findDescendants(node, INPUT_SELECT_TEXT_FIELDS).filter(
          input => input.attributes.type !== 'button' && input.attributes.type !== 'submit',
        ).length === 0;

      if (emptyFor) {
        node.context.reasons.push({ type: 'empty-for', reference: node.attributes.for });
      }

      if (invalidFor) {
        node.context.reasons.push({ type: 'for', reference: node.attributes.for });
      } else if (invalidAria) {
        node.context.reasons.push({ type: 'id', reference: node.attributes.id });
      }

      return emptyFor || invalidFor || invalidAria || invalidChild;
    });
  if (invalidFields.length) {
    return {
      auditType: 'label-no-field',
      items: invalidFields,
    };
  }
}

export const labelAudits: AuditMetadata[] = [
  { type: 'warning', weight: 1, audit: hasEmptyLabel },
  { type: 'warning', weight: 1, audit: hasUniqueLabels },
  { type: 'warning', weight: 1, audit: hasLabelWithValidElements },
  { type: 'warning', weight: 1, audit: hasLabelWithUniqueForAttribute },
  { type: 'warning', weight: 4, audit: hasInput },
];
