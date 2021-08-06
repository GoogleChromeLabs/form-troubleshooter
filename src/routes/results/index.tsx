import { FunctionalComponent, h } from 'preact';
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
        <p>No issues have been found.</p>
      )}
    </div>
  );
};

export default Results;
