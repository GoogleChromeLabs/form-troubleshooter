/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { runAttributeAudits } from './attributes';
import { runAutocompleteAudits } from './autocomplete';
import { runFormAudits } from './forms';
import { runInputAudits } from './inputs';
import { runLabelAudits } from './labels';

export function runAudits(tree: TreeNodeWithParent): AuditDetails {
  return {
    score: 0.9,
    results: [
      ...runFormAudits(tree),
      ...runAttributeAudits(tree),
      ...runAutocompleteAudits(tree),
      ...runLabelAudits(tree),
      ...runInputAudits(tree),
    ],
  };
}
