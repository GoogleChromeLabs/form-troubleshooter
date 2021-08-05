import { Fragment, FunctionalComponent, h } from 'preact';
import Table from '../../components/table';
import { stringifyFormElement } from '../../lib/audits/audit-util';
import { findDescendants, getTextContent } from '../../lib/tree-util';
import {
  handleHighlightClick,
  handleHighlightMouseEnter,
  handleHighlightMouseLeave,
} from '../../lib/element-highlighter';
import style from './style.css';

interface Props {
  documentTree: TreeNodeWithParent | undefined;
}

const Details: FunctionalComponent<Props> = props => {
  const { documentTree: tree } = props;
  let forms: TreeNodeWithParent[] = [];
  const formSections = [
    {
      name: 'Inputs',
      getItems(form: TreeNodeWithParent) {
        return findDescendants(form, ['input']).map(field => ({
          ...field.attributes,
          required: field.attributes.required !== undefined ? 'true' : '',
          _field: field,
        }));
      },
      columns: ['id', 'name', 'class', 'type', 'autocomplete', 'placeholder', 'required'],
    },
    {
      name: 'Selects',
      getItems(form: TreeNodeWithParent) {
        return findDescendants(form, ['select']).map(field => ({
          ...field.attributes,
          required: field.attributes.required !== undefined ? 'true' : '',
          _field: field,
        }));
      },
      columns: ['id', 'name', 'class', 'placeholder', 'required'],
    },
    {
      name: 'Text areas',
      getItems(form: TreeNodeWithParent) {
        return findDescendants(form, ['textarea']).map(field => ({
          ...field.attributes,
          required: field.attributes.required !== undefined ? 'true' : '',
          _field: field,
        }));
      },
      columns: ['id', 'name', 'class', 'autocomplete', 'placeholder', 'required'],
    },
    {
      name: 'Buttons',
      getItems(form: TreeNodeWithParent) {
        return findDescendants(form, ['button']).map(field => ({
          ...field.attributes,
          text: getTextContent(field),
          _field: field,
        }));
      },
      columns: ['id', 'name', 'class', 'text', 'type'],
    },
    {
      name: 'Labels',
      getItems(form: TreeNodeWithParent) {
        return findDescendants(form, ['label']).map(field => ({
          ...field.attributes,
          text: getTextContent(field),
          _field: field,
        }));
      },
      columns: ['id', 'name', 'class', 'for', 'text'],
    },
  ];

  if (tree) {
    forms = findDescendants(tree, ['form']);
  }

  return (
    <div class={style.details}>
      {forms.map((form, formIndex) => (
        <Fragment key={formIndex}>
          <h3>
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
          {formSections.map((section, sectionIndex) => {
            const items = section.getItems(form);
            if (!items.length) {
              return null;
            }

            return (
              <Fragment key={sectionIndex}>
                <h4>
                  {section.name} ({items.length})
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
