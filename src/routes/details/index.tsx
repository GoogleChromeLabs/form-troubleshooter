/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { Fragment, FunctionalComponent, h } from 'preact';
import Table from '../../components/table';
import { stringifyFormElement } from '../../lib/audits/audit-util';
import { closestParent, findDescendants, getTextContent } from '../../lib/tree-util';
import {
  handleHighlightClick,
  handleHighlightMouseEnter,
  handleHighlightMouseLeave,
} from '../../lib/element-highlighter';
import style from './style.css';
import { groupBy } from '../../lib/array-util';
import Score from '../../components/summary/score';
import { runAudits } from '../../lib/audits/audits';

interface Props {
  documentTree: TreeNodeWithParent | undefined;
}

const Details: FunctionalComponent<Props> = props => {
  const { documentTree: tree } = props;
  let forms: Map<TreeNodeWithParent | null, Map<string, TreeNodeWithParent[]>> = new Map();
  const formSections = [
    {
      name: 'Inputs',
      type: 'input',
      toItem(item: TreeNodeWithParent) {
        return {
          ...item.attributes,
          required: item.attributes.required !== undefined ? 'true' : '',
          _field: item,
        };
      },
      columns: ['id', 'name', 'class', 'type', 'autocomplete', 'placeholder', 'required'],
    },
    {
      name: 'Selects',
      type: 'select',
      toItem(item: TreeNodeWithParent) {
        return {
          ...item.attributes,
          required: item.attributes.required !== undefined ? 'true' : '',
          _field: item,
        };
      },
      columns: ['id', 'name', 'class', 'placeholder', 'required'],
    },
    {
      name: 'Text areas',
      type: 'textarea',
      toItem(item: TreeNodeWithParent) {
        return {
          ...item.attributes,
          required: item.attributes.required !== undefined ? 'true' : '',
          _field: item,
        };
      },
      columns: ['id', 'name', 'class', 'autocomplete', 'placeholder', 'required'],
    },
    {
      name: 'Buttons',
      type: 'button',
      toItem(item: TreeNodeWithParent) {
        return {
          ...item.attributes,
          text: getTextContent(item),
          _field: item,
        };
      },
      columns: ['id', 'name', 'class', 'text', 'type'],
    },
    {
      name: 'Labels',
      type: 'label',
      toItem(item: TreeNodeWithParent) {
        return {
          ...item.attributes,
          text: getTextContent(item),
          _field: item,
        };
      },
      columns: ['id', 'name', 'class', 'for', 'text'],
    },
  ];

  if (tree) {
    // find forms by section types
    forms = new Map(
      Array.from(
        groupBy(
          findDescendants(
            tree,
            formSections.map(section => section.type),
          ),
          item => closestParent(item, 'form'),
        ).entries(),
      ).map(([form, fields]) => [form, groupBy(fields, field => field.name!)]),
    );

    // find forms that don't have elements
    const allForms = findDescendants(tree, ['form']);
    allForms.forEach(form => {
      if (!forms.has(form)) {
        forms.set(form, new Map());
      }
    });
  }

  return (
    <div class={style.details}>
      {Array.from(forms.entries())
        .sort(([key1], [key2]) => (`${key1}` < `${key2}` ? -1 : 0))
        .map(([form, fieldsMap], formIndex) => (
          <Fragment key={formIndex}>
            {form ? (
              <h3>
                {form.parent ? (
                  <Score class={style.miniScore} radius={7} stroke={3} value={runAudits(form.parent).score} />
                ) : null}
                Form:{' '}
                <a
                  onClick={() => {
                    handleHighlightClick(form);
                  }}
                  onMouseEnter={() => {
                    handleHighlightMouseEnter(form);
                  }}
                  onMouseLeave={() => {
                    handleHighlightMouseLeave(form);
                  }}
                >
                  <code>{stringifyFormElement(form)}</code>
                </a>
              </h3>
            ) : (
              <h3>
                Elements not in a <code>&lt;form&gt;</code>
              </h3>
            )}
            {formSections.map((section, sectionIndex) => {
              const items = fieldsMap.get(section.type)?.map(field => section.toItem(field));
              if (!items?.length) {
                return null;
              }

              return (
                <Fragment key={sectionIndex}>
                  <h4>
                    {section.name} <span class="deemphasise">({items.length})</span>
                  </h4>
                  <Table
                    items={items}
                    columns={section.columns}
                    onRowClick={(row, item) => {
                      handleHighlightClick(item._field);
                    }}
                    onRowEnter={(row, item) => {
                      handleHighlightMouseEnter(item._field);
                    }}
                    onRowLeave={(row, item) => {
                      handleHighlightMouseLeave(item._field);
                    }}
                  />
                </Fragment>
              );
            })}
          </Fragment>
        ))}
    </div>
  );
};

export default Details;
