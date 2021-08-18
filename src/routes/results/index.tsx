/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { Fragment, FunctionalComponent, h } from 'preact';
import ResultItem from './result-item';
import style from './style.css';

interface Props {
  results: AuditResult[];
  onRender?: () => void;
}

const Results: FunctionalComponent<Props> = props => {
  const { results } = props;
  const element = (
    <div class={style.results}>
      {results.length ? (
        <ul class={style.audit}>
          {results.map((result, index) => (
            <li key={index}>
              <ResultItem item={result} />
            </li>
          ))}
        </ul>
      ) : (
        <Fragment>
          <h3>Looking good</h3>
          <p>There are no issues with this page.</p>
        </Fragment>
      )}
    </div>
  );

  props.onRender?.();

  return element;
};

export default Results;
