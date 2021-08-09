/* eslint-disable react/display-name */
import { ComponentChildren, Fragment, FunctionalComponent, h } from 'preact';
import CodeWrap from '../../components/code-wrap';
import { stringifyFormElement } from '../../lib/audits/audit-util';
import {
  handleHighlightClick,
  handleHighlightMouseEnter,
  handleHighlightMouseLeave,
} from '../../lib/element-highlighter';
import { pluralize } from '../../lib/string-util';
import style from './style.css';

interface Props {
  item: AuditResult;
}

interface AuditTypePresenter {
  title: ComponentChildren | ((result: AuditResult) => ComponentChildren);
  render: (result: AuditResult) => ComponentChildren;
  references: LearnMoreReference[];
}

type ItemRenderer<T> = (
  item: TreeNodeWithContext<T>,
  extraContext?: (contextItem: TreeNodeWithContext<T>) => ComponentChildren | undefined,
) => ComponentChildren | null;

function defaultItemRenderer<T>(
  item: TreeNodeWithContext<T>,
  extraContext?: (contextItem: TreeNodeWithContext<T>) => ComponentChildren | undefined,
) {
  return (
    <Fragment>
      <a
        onClick={() => handleHighlightClick(item)}
        onMouseEnter={() => handleHighlightMouseEnter(item)}
        onMouseLeave={() => handleHighlightMouseLeave(item)}
      >
        <code>{stringifyFormElement(item)}</code>
      </a>
      {extraContext ? extraContext(item) : null}
    </Fragment>
  );
}

function defaultItemsPresenter<T>(
  items: TreeNodeWithContext<T>[],
  itemRenderer: ItemRenderer<T> = defaultItemRenderer,
): JSX.Element {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{itemRenderer(item)}</li>
      ))}
    </ul>
  );
}

function suggestionItemRenderer(item: TreeNodeWithContext<ContextSuggestion>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context: any = item.context;
  return (
    <Fragment>
      <a
        onClick={() => handleHighlightClick(item)}
        onMouseEnter={() => handleHighlightMouseEnter(item)}
        onMouseLeave={() => handleHighlightMouseLeave(item)}
      >
        <CodeWrap text={stringifyFormElement(item)} emphasize={context?.token} />
      </a>
      {item.context?.suggestion ? (
        <div>
          Did you mean <code>{item.context?.suggestion}</code>?
        </div>
      ) : null}
    </Fragment>
  );
}

function duplicateItemRenderer(item: TreeNodeWithContext<ContextDuplicates>): JSX.Element {
  return (
    <Fragment>
      <a
        onClick={() => handleHighlightClick(item)}
        onMouseEnter={() => handleHighlightMouseEnter(item)}
        onMouseLeave={() => handleHighlightMouseLeave(item)}
      >
        <code>{stringifyFormElement(item)}</code>
      </a>
      {item.context?.duplicates?.length
        ? item.context?.duplicates.map((dup, index) => <Fragment key={index}>, {defaultItemRenderer(dup)}</Fragment>)
        : null}
    </Fragment>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const auditPresenters: { [auditType: string]: AuditTypePresenter } = {
  'autocomplete-attribute': {
    title: 'Increase conversions by including autocomplete attributes',
    render: result => (
      <Fragment>
        <p>
          Found {pluralize(result.items.length, 'a form field', 'form fields')} with no <code>autocomplete</code>{' '}
          attribute, even though an appropriate value is available:
        </p>
        {defaultItemsPresenter(result.items)}
      </Fragment>
    ),
    references: [
      {
        title: 'Help users to avoid re-entering data',
        url: 'https://web.dev/sign-in-form-best-practices/#autofill',
      },
    ],
  },
  'autocomplete-empty': {
    title: 'Increase conversions by using correct autocomplete attributes',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'a form field', 'form fields')} with empty autocomplete values:</p>
        {defaultItemsPresenter(result.items)}
      </Fragment>
    ),
    references: [
      {
        title: 'The HTML autocomplete attribute: Values',
        url: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values',
      },
    ],
  },
  'autocomplete-off': {
    title: (
      <Fragment>
        Setting <code>autocomplete="off"</code> doesn't always work as expected
      </Fragment>
    ),
    render: result => (
      <Fragment>
        <p>
          Found {pluralize(result.items.length, 'a form field', 'form fields')} with <code>autocomplete="off"</code>
        </p>
        {defaultItemsPresenter(result.items)}
        <p>
          Although <code>autocomplete="off"</code> is{' '}
          <a
            href="https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-off"
            title="HTML spec autocomplete attribute information"
          >
            valid HTML
          </a>{' '}
          and has legitimate use cases, it can be problematic for users (forcing them to reenter data) and may not work
          as expected (such as with autofill behaviour in name, address and payment forms).
        </p>
      </Fragment>
    ),
    references: [
      {
        title: 'HTML spec autocomplete attribute information',
        url: 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-off',
      },
      {
        title: 'The HTML autocomplete attribute: Values',
        url: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values',
      },
    ],
  },
  'autocomplete-valid': {
    title: 'Increase conversions by using correct autocomplete attributes',
    render: result => (
      <Fragment>
        <p>
          Found {pluralize(result.items.length, 'a form field', 'form fields')} with invalid <code>autocomplete</code>{' '}
          values:
        </p>
        {defaultItemsPresenter(result.items, suggestionItemRenderer)}
      </Fragment>
    ),
    references: [
      {
        title: 'The HTML autocomplete attribute',
        url: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete',
      },
    ],
  },
  'form-empty': {
    title: 'Forms should contain form fields',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'a form', 'forms')} without any form fields:</p>
        {defaultItemsPresenter(result.items)}
      </Fragment>
    ),
    references: [
      {
        title: 'MDN: The HTML form element',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form',
      },
    ],
  },
  'input-label': {
    title:
      'Help your users using alternate input methods complete this form by ensuring each field is correctly labeled',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'an input field', 'input fields')} without a corresponding label:</p>
        {defaultItemsPresenter(result.items, item =>
          defaultItemRenderer<{ reasons?: Array<{ type: string; reference: string }> }>(item, contextItem => (
            <Fragment>
              <ul>
                {(contextItem.context?.reasons ?? []).map((reason, index) => (
                  <li key={index}>
                    {reason.type === 'id' ? (
                      <Fragment>
                        There are no labels that reference <code>for="{reason.reference}"</code>
                      </Fragment>
                    ) : null}
                    {reason.type === 'aria-labelledby' ? (
                      <Fragment>
                        None of the referenced labels exist:
                        {reason.reference
                          .split(' ')
                          .filter(Boolean)
                          .map((id, idIndex) => (
                            <Fragment key={idIndex}>
                              {idIndex ? ', ' : ''}
                              <span>
                                <code>{id}</code>
                              </span>
                            </Fragment>
                          ))}
                      </Fragment>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Fragment>
          )),
        )}
      </Fragment>
    ),
    references: [
      {
        title: 'MDN: Labels',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label',
      },
    ],
  },
  'input-type-valid': {
    title: 'Unrecognized input types can lead to unexpected and incosistent user experiences',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'an input field', 'input fields')} with invalid types:</p>
        {defaultItemsPresenter(result.items, suggestionItemRenderer)}
      </Fragment>
    ),
    references: [
      {
        title: 'MDN: The Input (Form Input) element',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types',
      },
    ],
  },
  'invalid-attributes': {
    title: 'Input and control elements with unrecognized attributes may not be achieving the desired outcome',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'an element', 'elements')} with invalid attributes</p>
        {defaultItemsPresenter(result.items, item =>
          defaultItemRenderer<{ invalidAttributes: Array<{ attribute?: string; suggestion?: string }> }>(
            item,
            contextItem => (
              <Fragment>
                <ul>
                  {contextItem.context!.invalidAttributes.map((context, index) => (
                    <li key={index}>
                      <code>{context.attribute}</code>
                      {context.suggestion ? (
                        <span>
                          {' '}
                          - did you mean <code>{context.suggestion}</code>?
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Fragment>
            ),
          ),
        )}
        <p>
          Consider using{' '}
          <a
            href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes"
            title="MDN article: Using data attributes"
          >
            data attributes
          </a>{' '}
          instead of non-standard attributes.
        </p>
      </Fragment>
    ),
    references: [
      {
        title: 'MDN article: Using data attributes',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes',
      },
      {
        title: 'HTML Living Standard: Forms',
        url: 'https://html.spec.whatwg.org/multipage/forms.html',
      },
    ],
  },
  'label-empty': {
    title: 'Labels must have text content',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'an empty label', 'empty labels')}:</p>
        {defaultItemsPresenter(result.items)}
      </Fragment>
    ),
    references: [
      {
        title: 'Empty or Missing Form Label',
        url: 'https://equalizedigital.com/accessibility-checker/empty-missing-form-label',
      },
    ],
  },
  'label-no-field': {
    title:
      'Make forms easier to use and more accessible by associating every label with a form field',
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'a label', 'labels')} that weren't associated with a form field:</p>
        {defaultItemsPresenter(result.items, item =>
          defaultItemRenderer<{ reasons?: Array<{ type: string; reference: string }> }>(item, contextItem => (
            <Fragment>
              <ul>
                {(contextItem.context?.reasons ?? []).map((reason, index) => (
                  <li key={index}>
                    {reason.type === 'id' ? (
                      <Fragment>
                        There are no form fields which reference label <code>{reason.reference}</code>
                      </Fragment>
                    ) : null}
                    {reason.type === 'for' ? (
                      <Fragment>
                        There are no form fields with <code>id="{reason.reference}"</code>
                      </Fragment>
                    ) : null}
                    {reason.type === 'empty-for' ? (
                      <Fragment>
                        There <code>for</code> attribute should not be empty
                      </Fragment>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Fragment>
          )),
        )}
      </Fragment>
    ),
    references: [
      {
        title: 'MDN: Labels',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label',
      },
    ],
  },

  'label-unique': {
    title:
      'Form fields with multiple labels may make it difficult for tools such as screen readers to correctly identify form fields',
    render: result => (
      <Fragment>
        <p>
          Found labels with the same <code>for</code> attribute:
        </p>
        {defaultItemsPresenter(result.items, duplicateItemRenderer)}
      </Fragment>
    ),
    references: [
      {
        title: 'Duplicate Form Label',
        url: 'https://equalizedigital.com/accessibility-checker/duplicate-form-label/',
      },
    ],
  },
  'label-valid-elements': {
    title: "Don't put headings or interactive elements in labels.",
    render: result => (
      <Fragment>
        <p>Found {pluralize(result.items.length, 'a label', 'labels')} containing a heading or interactive element:</p>
        {defaultItemsPresenter(result.items, item =>
          defaultItemRenderer<{ fields: TreeNodeWithParent[] }>(item, contextItem => (
            <Fragment>
              {' contains the following elements: '}
              {contextItem.context!.fields.map((field, index) => (
                <Fragment key={index}>
                  {index ? ', ' : ''}
                  <code>{field.name}</code>
                </Fragment>
              ))}
            </Fragment>
          )),
        )}
      </Fragment>
    ),
    references: [
      {
        title: 'Label element: Accessibility concerns',
        url: 'https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns',
      },
    ],
  },
  'missing-identifier': {
    title: (
      <Fragment>
        Form fields should have an <code>id</code> or a <code>name</code>
      </Fragment>
    ),
    render: result => (
      <Fragment>
        <p>
          Found {pluralize(result.items.length, 'a form field', 'form fields')} with no <code>id</code> attribute and no{' '}
          <code>name</code> attribute:
        </p>
        {defaultItemsPresenter(result.items)}
      </Fragment>
    ),
    references: [
      {
        title: 'The HTML name attribute',
        url: 'https://developer.mozilla.org/docs/Web/HTML/Element/input#htmlattrdefname',
      },
    ],
  },
  'unique-ids': {
    title: (
      <Fragment>
        Form fields must have unique <code>id</code> values
      </Fragment>
    ),
    render: result => (
      <Fragment>
        <p>
          Found form fields with duplicate <code>id</code> attributes:
        </p>
        {defaultItemsPresenter(result.items, duplicateItemRenderer)}
      </Fragment>
    ),
    references: [
      {
        title: 'ID attribute value must be unique',
        url: 'https://dequeuniversity.com/rules/axe/4.2/duplicate-id-active',
      },
    ],
  },
  'unique-names': {
    title: (
      <Fragment>
        Fields in the same form must have unique <code>name</code> values
      </Fragment>
    ),
    render: result => (
      <Fragment>
        <p>
          Found fields in the same form with duplicate <code>name</code> attributes:
        </p>
        {defaultItemsPresenter(result.items, duplicateItemRenderer)}
      </Fragment>
    ),
    references: [
      {
        title: 'The input element name attribute',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname',
      },
    ],
  },
};

const ResultItem: FunctionalComponent<Props> = props => {
  const presenter = auditPresenters[props.item.auditType];

  return (
    <div>
      <h3>{presenter.title}</h3>
      <div class={style.details}>{presenter.render(props.item)}</div>

      {presenter.references.length ? (
        <p class={style.learnMore}>
          Learn more:{' '}
          {presenter.references.map((ref, index) => (
            <span key={index}>
              {index ? ', ' : ''}
              <a href={ref.url} target="_blank" rel="noreferrer noopener">
                {ref.title}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
};

export default ResultItem;
