/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { attributeAudits } from './attributes';
import { autocompleteAudits } from './autocomplete';
import { formAudits } from './forms';
import { inputAudits } from './inputs';
import { labelAudits } from './labels';

interface AuditRun {
  audit: AuditMetadata;
  result?: AuditResult;
}

const scoreReducer = ({ score, max }: { score: number; max: number }, result: AuditRun) => ({
  score: score + (result.result !== undefined ? 0 : result.audit.weight),
  max: max + result.audit.weight,
});

export function runAudits(tree: TreeNodeWithParent): AuditDetails {
  const audits = [...attributeAudits, ...formAudits, ...autocompleteAudits, ...labelAudits, ...inputAudits];
  const errorResults: AuditRun[] = [];
  const warningResults: AuditRun[] = [];

  audits
    .sort((a, b) => b.weight - a.weight)
    .forEach(audit => {
      const result = audit.audit(tree);

      if (audit.type === 'error') {
        errorResults.push({ audit, result });
      } else {
        warningResults.push({ audit, result });
      }
    });

  const errorsScore = errorResults.reduce(scoreReducer, { score: 0, max: 0 });
  const warningsScore = warningResults.reduce(scoreReducer, { score: 0, max: 0 });
  const totalScore = (errorsScore.score / errorsScore.max) * 0.9 + (warningsScore.score / warningsScore.max) * 0.1;
  console.log(totalScore, errorsScore, warningsScore);

  return {
    score: totalScore,
    errors: errorResults.map(result => result.result).filter(Boolean) as AuditResult[],
    warnings: warningResults.map(result => result.result).filter(Boolean) as AuditResult[],
  };
}
