/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { FunctionalComponent, h } from 'preact';
import style from './style.css';
import Score from './score';
import { pluralize } from '../../lib/string-util';
import { route } from 'preact-router';

interface Props {
  className?: string;
  score: number;
  recommendations: AuditResult<unknown>[];
  commonMistakes: AuditResult<unknown>[];
}

const AuditSummary: FunctionalComponent<Props> = (props: Props) => {
  const { className, score, recommendations, commonMistakes } = props;

  return (
    <div class={[style.summary, className].filter(Boolean).join(' ')}>
      <Score class={style.score} radius={50} stroke={8} value={score} text={(score * 100).toFixed(0)} />
      <div class={style.result}>
        <dl>
          <dt class={style.recommended} onClick={() => route('/recommendations')}>
            {pluralize(recommendations.length, 'recommendation')}
          </dt>
          <dd class={style.recommended} onClick={() => route('/recommendations')}>
            {recommendations.length}
          </dd>
          <dt class={style.other} onClick={() => route('/mistakes')}>
            common {pluralize(commonMistakes.length, 'mistake')}
          </dt>
          <dd class={style.other} onClick={() => route('/mistakes')}>
            {commonMistakes.length}
          </dd>
        </dl>
      </div>
    </div>
  );
};

export default AuditSummary;
