/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

// runAudits() is called in popup.js after elementData is set using values from content-script.js
/* exported runAudits */
/* global elementData */

const items = [];

let inputsSelectsTextareas;

// From https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
const AUTOCOMPLETE_TOKENS = ['additional-name', 'address-level1', 'address-level2',
  'address-level3', 'address-level4', 'address-line1', 'address-line2', 'address-line3', 'bday',
  'bday-day', 'bday-month', 'bday-year', 'billing', 'cc-additional-name', 'cc-csc', 'cc-exp', 'cc-exp-month',
  'cc-exp-year', 'cc-family-name', 'cc-given-name', 'cc-name', 'cc-number', 'cc-type', 'country',
  'country-name', 'current-password', 'email', 'family-name', 'fax', 'given-name', 'home', 'honorific-prefix',
  // Allow 'on'.
  'honorific-suffix', 'impp', 'language', 'mobile', 'name', 'new-password', 'nickname', 'on', 'one-time-code',
  'organization', 'organization-title', 'pager', 'photo', 'postal-code', 'sex', 'shipping', 'street-address',
  'tel', 'tel-area-code', 'tel-country-code', 'tel-extension', 'tel-local', 'tel-national',
  'transaction-amount', 'transaction-currency', 'url', 'username', 'work'];

// Run all audits and display errors and warnings as necessary.
// Called by popup.js after it sets the value of elementData, using data about
// elements on the current page stored by content-script.js using chrome.storage.
function runAudits() {
  inputsSelectsTextareas =
    elementData.input.concat(elementData.select).concat(elementData.textarea);
  // console.log('inputsSelectsTextareas', inputsSelectsTextareas);
  runElementAudits();
  runAttributeAudits();
  runAutocompleteAudits();
  runLabelAudits();
  const numErrors = items.filter(item => item.type === 'error').length;
  const numWarnings = items.filter(item => item.type === 'warning').length;
  for (const item of items) {
    displayItem(item);
  }
  if (numErrors > 0) {
    const summary = document.querySelector('details#error summary');
    summary.classList.remove('inactive');
    summary.textContent = `${numErrors} error`;
    if (numErrors > 1) {
      summary.textContent += 's';
    }
  }
  if (numWarnings > 0) {
    const summary = document.querySelector('details#warning summary');
    summary.classList.remove('inactive');
    summary.textContent = `${numWarnings} warning`;
    if (numWarnings > 1) {
      summary.textContent += 's';
    }
  }
}

// Add a warning or an error to popup.html.
function displayItem(item) {
  // details will be details#error or details#warning
  const details = document.getElementById(item.type);
  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  h2.innerHTML = item.title;
  section.appendChild(h2);
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('details');
  detailsDiv.innerHTML = item.details;
  section.appendChild(detailsDiv);
  const learnMoreDiv = document.createElement('div');
  learnMoreDiv.classList.add('learn-more');
  learnMoreDiv.innerHTML = item.learnMore;
  section.appendChild(learnMoreDiv);
  details.appendChild(section);
}

/* Groups of audits. These call the individual audits below. */

// Elements.
function runElementAudits() {
  hasNoFormElementsWithoutFormFields();
}

// Attributes.
function runAttributeAudits() {
  hasNoElementsWithInvalidAttributes();
  hasFieldsWithIdOrName();
  hasElementsWithUniqueIds();
  hasElementsWithUniqueNames();
}

// Autocomplete.
function runAutocompleteAudits() {
  hasFieldsWithAutocompleteAttributes();
  hasNoFieldsWithEmptyAutocomplete();
  hasFieldsWithValidAutocompleteAttributes();
  hasNoFieldsWithAutocompleteOff();
}

// Labels.
function runLabelAudits() {
  hasNoEmptyLabels();
  hasUniqueLabels();
  hasNoLabelsContainingInvalidElements();
  hasNoLabelsMissingForAttributes();
  hasNoEmptyForAttributes();
  hasUniqueForAttributes();
  hasForAttributesThatMatchIds();
}

/* Individual audits. These are called from functions above that group audits. */

// Form fields have valid attributes as defined in ATTRIBUTES in content-script.js.
function hasNoElementsWithInvalidAttributes() {
  const allElements = Object.values(elementData).flat();
  const problemElements = allElements
    .filter (element => element.invalidAttributes)
    .map(element => `${element.tagName}: ${element.invalidAttributes}`);
  if (problemElements.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found element(s) with invalid attributes:<br>• ' +
        `${problemElements.join('<br>• ')}` +
        '<br>Consider using <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes" title="MDN article: Using data attributes">data attributes</a> instead of non-standard attributes.',
      learnMore: 'Learn more: <a href="https://html.spec.whatwg.org/multipage/forms.html">HTML Living Standard: Forms</a>',
      title: 'Element attributes should be valid.',
      type: 'warning',
    };
    items.push(item);
  }
}

// Form fields have either an id or a name attribute.
function hasFieldsWithIdOrName() {
  // Attributes may be either missing or empty.
  // Inputs with type submit or file don't need an id or name.
  const problemFields = inputsSelectsTextareas
    .filter (field => !field.id && !field.name && field.type !== 'submit' && field.type !== 'file')
    .map(field => stringifyElement(field));
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form field(s) with no <code>id</code> attribute and no <code>name</code> attribute:<br>• ' +
        `${problemFields.join('<br>• ')}<br>(This may not be an error.)`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Element/input#htmlattrdefname">The HTML name attribute</a>',
      title: 'Form fields should have an <code>id</code> or a <code>name</code>.',
      type: 'warning',
    };
    items.push(item);
  }
}

// Element id values are unique.
function hasElementsWithUniqueIds() {
  const duplicates = findDuplicates(inputsSelectsTextareas, 'id');
  let problemFields = duplicates
    .map(field => stringifyElement(field));
  // Deduplicate items with same tagName and id.
  problemFields = [...new Set(problemFields)];
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form fields with duplicate <code>id</code> attributes:<br>• ' +
        `${problemFields.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://dequeuniversity.com/rules/axe/4.2/duplicate-id-active">ID attribute value must be unique</a>',
      title: 'Form fields must have unique <code>id</code> values.',
      type: 'error',
    };
    items.push(item);
  }
}


// Element name values within the same form are unique.
// Other than <input type="radio" ...> or <input type="checkbox" ...> this is an error.
function hasElementsWithUniqueNames() {
  let duplicates = findDuplicates(inputsSelectsTextareas, 'name', 'formAncestorID')
    // Radio buttons have duplicate names.
    .filter(field => field.type !== 'radio' && field.type !== 'checkbox');
  let problemFields = duplicates.map(field => stringifyElement(field));
  // Deduplicate items with same tagName and id.
  problemFields = [...new Set(problemFields)];
  console.log('>>>', problemFields);
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found fields in the same form with duplicate <code>name</code> attributes:<br>• ' +
        `${problemFields.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname">The input element name attribute</a>',
      title: 'Fields in the same form must have unique <code>name</code> values.',
      type: 'error',
    };
    items.push(item);
  }
}

// Form fields have autocomplete attributes when appropriate.
// Empty autocomplete are handled in hasNoFieldsWithEmptyAutocomplete().
function hasFieldsWithAutocompleteAttributes() {
  const problemFields = inputsSelectsTextareas
    .filter(field => field.autocomplete === null && field.type !== 'hidden' &&
        (AUTOCOMPLETE_TOKENS.includes(field.id) || AUTOCOMPLETE_TOKENS.includes(field.name)))
    .map(field => stringifyElement(field));
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form field(s) with no <code>autocomplete</code> attribute, ' +
        'even though an appropriate value is available:<br>• ' +
        `${problemFields.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://web.dev/sign-in-form-best-practices/#autofill">Help users to avoid re-entering data</a>',
      title: 'Form fields should use autocomplete where possible.',
      type: 'warning',
    };
    items.push(item);
  }
}

// Form autocomplete atttribute values are valid.
// See also: hasNoFieldsWithAutocompleteOff() and hasNoFieldsWithEmptyAutocomplete().
function hasFieldsWithValidAutocompleteAttributes() {
  const problemFields = [];
  for (const field of inputsSelectsTextareas) {
    // fields missing autocomplete, autocomplete="", and autocomplete="off" are handled elsewhere.
    if (!field.autocomplete || field.autocomplete === 'off') {
      continue;
    }
    // autocomplete attributes may include multiple tokens, e.g. autocomplete="shipping postal-code".
    // section-* is also allowed.
    // The test here is only for valid tokens: token order isn't checked.
    for (const token of field.autocomplete.split(' ')) {
      if (!AUTOCOMPLETE_TOKENS.includes(token) && !token.startsWith('section-')) {
        problemFields.push(stringifyElement(field));
      }
    }
  }
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form field(s) with invalid <code>autocomplete</code> values:<br>• ' +
        `${problemFields.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete">The HTML autocomplete attribute</a>',
      title: 'Autocomplete values must be valid.',
      type: 'error',
    };
    items.push(item);
  }
}

// Form fields do not have autocomplete with value 'off'.
// See also: hasFieldsWithValidAutocompleteAttributes() and hasNoFieldsWithEmptyAutocomplete().
function hasNoFieldsWithAutocompleteOff() {
  const problemFields = inputsSelectsTextareas
    .filter(field => field.autocomplete === 'off')
    .map(field => stringifyElement(field));
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form field(s) with <code>autocomplete="off"</code>:<br>• ' +
        `${problemFields.join('<br>• ')}<br>Although <code>autocomplete="off"</code> is 
          <a href="https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-off" 
          title="HTML spec autocomplete attribute information">valid HTML</a>, most browsers ignore 
          it: setting <code>autocomplete="off"</code> does not disable autofill.`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values">The HTML autocomplete attribute: Values</a>',
      title: 'Form fields should not use autocomplete="off".',
      type: 'warning',
    };
    items.push(item);
  }
}

// Form fields do not have autocomplete with empty value.
// See also: hasFieldsWithValidAutocompleteAttributes() and hasNoFieldsWithAutocompleteOff().
function hasNoFieldsWithEmptyAutocomplete() {
  const problemFields = inputsSelectsTextareas
    .filter(field => field.autocomplete === '')
    .map(field => stringifyElement(field));
  if (problemFields.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form field(s) with empty autocomplete values:<br>• ' +
        `${problemFields.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete#values">The HTML autocomplete attribute: Values</a>',
      title: 'Autocomplete values must not be empty.',
      type: 'error',
    };
    items.push(item);
  }
}

// All form elements contain at least one form field element.
function hasNoFormElementsWithoutFormFields() {
  const problemForms = elementData.form
    .filter(form => !form.containsFormField)
    .map(form => stringifyElement(form));
  if (problemForms.length) {
    const item = {
      // description: 'Autocomplete values must be valid.',
      details: 'Found form(s) not containing any form fields:<br>• ' +
        `${problemForms.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form">MDN: The HTML form element</a>.',
      title: 'Forms should contain form fields.',
      type: 'error',
    };
    items.push(item);
  }
}

// Labels do not contain interactive elements or headings.
// See https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns.
function hasNoLabelsContainingInvalidElements() {
  const problemLabels = elementData.label
    .filter(label => label.invalidLabelDescendants)
    .map(label => `Label '${label.textContent}' contains the element <code>&lt;${label.invalidLabelDescendants}&gt;</code>.`);
  if (problemLabels.length) {
    const item = {
      // description: 'The for attribute of a label must not be empty.',
      details: 'Found label(s) containing a heading or interactive element:<br>• ' +
        `${problemLabels.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Element/label#accessibility_concerns">Label element: Accessibility concerns</a>',
      title: 'Don\'t put headings or interactive elements in labels.',
      type: 'warning',
    };
    items.push(item);
  }
}

// In the same form, all label values are unique, i.e. no labels have duplicate textContent.
function hasUniqueLabels() {
  // Ignore duplicates in different forms.
  const problemLabels = findDuplicates(elementData.label, 'textContent', 'formAncestorID')
    .map(label => stringifyElement(label));
  if (problemLabels.length) {
    const item = {
      // description: 'Labels should have unique values.',
      details: 'Found labels in the same form with duplicate values:<br>• ' +
        `${problemLabels.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://equalizedigital.com/accessibility-checker/duplicate-form-label/">Duplicate Form Labels</a>',
      title: 'Labels in the same form should have unique values.',
      type: 'warning',
    };
    items.push(item);
  }
}

// All labels have textContent (i.e. are not empty).
function hasNoEmptyLabels() {
  const problemLabels = elementData.label
    .filter(label => label.textContent === '')
    .map(label => stringifyElement(label));
  if (problemLabels.length) {
    const item = {
      // description: 'The for attribute of a label must not be empty.',
      details: `Found empty label(s):<br>• ${problemLabels.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://equalizedigital.com/accessibility-checker/empty-missing-form-label">Empty or Missing Form Label</a>',
      title: 'Labels must have text content.',
      type: 'error',
    };
    items.push(item);
  }
}

// All labels should have a for attribute.
// See also: hasNoEmptyForAttributes().
function hasNoLabelsMissingForAttributes() {
  const problemLabels = elementData.label
    // Ignore labels that contain form fields: they don't need for attributes.
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#:~:text=nest
    .filter(label => !label.containsFormField && label.for === null)
    .map(label => stringifyElement(label));
  if (problemLabels.length) {
    const item = {
      // description: 'All labels should have a for attribute.',
      details: 'Found label(s) with no form field descendant, and with no <code>for</code> attribute:<br>• ' +
        `${problemLabels.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/for#usage">The HTML for attribute</a>',
      title: 'Labels must have a for attribute or contain a form field.',
      type: 'error',
    };
    items.push(item);
  }
}

// No for attribute values are empty.
// See also hasNoLabelsMissingForAttributes().
function hasNoEmptyForAttributes() {
  const problemLabels = elementData.label
    .filter(label => label.for === '')
    .map(label => stringifyElement(label));
  if (problemLabels.length) {
    const item = {
      // description: 'The for attribute of a label must not be empty.',
      details: 'Found label(s) with an empty <code>for</code> attribute:<br>• ' +
        `${problemLabels.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/for#usage">The HTML for attribute</a>',
      title: 'The for attribute of a label must not be empty.',
      type: 'error',
    };
    items.push(item);
  }
}

// All for attributes are unique.
function hasUniqueForAttributes() {
  const duplicates = findDuplicates(elementData.label, 'for');
  let problemLabels = duplicates.map(label => stringifyElement(label));
  // Deduplicate.
  problemLabels = [...new Set(problemLabels)];
  if (problemLabels.length) {
    const item = {
      // description: 'The for attribute of a label must be unique.',
      details: 'Found labels with the same <code>for</code> attribute:<br>• ' +
        problemLabels.join('<br>• '),
      learnMore: 'Learn more: <a href="https://equalizedigital.com/accessibility-checker/duplicate-form-label/">Duplicate Form Label</a>',
      title: 'The for attribute of a label must be unique.',
      type: 'error',
    };
    items.push(item);
  }
}

// All for attributes match the id of a form field.
function hasForAttributesThatMatchIds() {
  const problemLabels = elementData.label
    .filter(label => label.for &&
      !inputsSelectsTextareas.find(element => element.id === label.for))
    .map(label => stringifyElement(label));
  if (problemLabels.length) {
    const item = {
      // description: 'The for attribute of a label must match the id of a form field.',
      details: 'The <code>for</code> attribute of the following label(s) does not match the id ' +
      `of a form field:<br>• ${problemLabels.join('<br>• ')}`,
      learnMore: 'Learn more: <a href="https://developer.mozilla.org/docs/Web/HTML/Attributes/for#usage">The HTML for attribute</a>',
      title: 'The for attribute of a label must match the id of a form field.',
      type: 'error',
    };
    items.push(item);
  }
}


/* Utility functions */

// Find objects in an array that have a non-null duplicate property value.
// Optionally, ignore duplicates if the value of the ignoreIfDifferent property is different.
// For example, ignore duplicate name attributes for form elements that are in different forms.
function findDuplicates(array, property, ignoreIfDifferent) {
  return array.filter((filterElement, filterIndex) => {
    return array.find((findElement, findIndex) => {
      const isDuplicate = filterElement[property] &&
        filterElement[property] === findElement[property] && filterIndex !== findIndex;
      // if (isDuplicate) {
      //   console.log('>>> filterElement[property]', filterElement[property], findElement[property],
      //     ignoreIfDifferent, filterElement[ignoreIfDifferent], findElement[ignoreIfDifferent]);
      // }
      // If the ignoreIfDifferent parameter is used, return the duplicates only if they have
      // the same (and non-null) value for the ignoreIfDifferent property.
      return ignoreIfDifferent ?
        isDuplicate && filterElement[ignoreIfDifferent] && findElement[ignoreIfDifferent] &&
          filterElement[ignoreIfDifferent] === findElement[ignoreIfDifferent] :
        isDuplicate;
    });
  });
}

// Create a representation of a form element.
function stringifyElement(field) {
  const attributesToInclude = ['action', 'autocomplete', 'class', 'for', 'id', 'name', 'placeholder'];
  // entry[0] is an attribute name, entry[1] is an attribute value (which may be null or empty).
  let attributes = Object.entries(field)
    .filter(entry => attributesToInclude.includes(entry[0]))
    // Include empty attributes, e.g. for="", but not missing attributes.
    .filter(entry => field[entry[0]] !== null)
    .map(entry => {
      // console.log('>>>', '|' + entry[0] + '|', '|' + entry[1] + '|');
      return `${entry[0]}="${entry[1]}"`;
    })
    .join(' ');

  const openingTag = `&lt;${field.tagName}${attributes ? ' ' + attributes : ''}&gt;`;
  return field.tagName === 'label' ?
    `<code>${openingTag}${field.textContent || ''}&lt;/label&gt;</code>` :
    `<code>${openingTag}</code>`;
}

// Test for findDuplicates().
// const family = [
//   {'first-name': 'Mike', 'second-name': 'Smith', 'age': 10},
//   {'first-name': 'Matt', 'second-name': 'Smith', 'age': 13},
//   {'first-name': 'Matt', 'second-name': 'Smith', 'age': 15},
//   {'first-name': 'Nancy', 'second-name': 'Smith', 'age': 25},
//   {'first-name': 'Nancy', 'second-name': 'Jensen', 'age': 35},
//   {'first-name': 'Adam', 'second-name': 'Smith', 'age': 22},
//   {'first-name': 'Jenny', 'second-name': 'Jonson', 'age': 85},
//   {'first-name': 'Carl', 'second-name': 'Smith', 'age': 40}
// ];
// const duplicates = findDuplicates(family, 'first-name', 'second-name');
// console.log('>>> duplicates', duplicates);

// const otherMethod = family.filter((element, index, array) => array.indexOf(element) !== index);
// console.log('>>> otherMethod', otherMethod);
