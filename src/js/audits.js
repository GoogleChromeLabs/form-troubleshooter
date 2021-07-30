/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import {runAttributeAudits} from './audits/attributes';
import {runAutocompleteAudits} from './audits/autocomplete';
import {runFormAudits} from './audits/forms';
import {runLabelAudits} from './audits/labels';

// runAudits() is called in popup.js after elementData is set using values from content-script.js

// Run all audits and display errors and warnings as necessary.
// Called by popup.js after it sets the value of elementData, using data about
// elements on the current page stored by content-script.js using chrome.storage.

export function runAudits(tree) {
  return [
    ...runFormAudits(tree),
    ...runAttributeAudits(tree),
    ...runAutocompleteAudits(tree),
    ...runLabelAudits(tree),
  ];
}
