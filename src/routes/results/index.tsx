import { Fragment, FunctionalComponent, h } from 'preact';
import ResultItem from './result-item';
import style from './style.css';

interface Props {
  results: AuditResult[];
}

const Results: FunctionalComponent<Props> = props => {
  const { results } = props;
  return (
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
};

export default Results;
