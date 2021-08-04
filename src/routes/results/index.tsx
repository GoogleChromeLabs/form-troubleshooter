import { FunctionalComponent, h } from 'preact';
import style from './style.css';

interface Props {
  results: any[];
}

const Results: FunctionalComponent<Props> = props => {
  const { results } = props;
  return (
    <div class={style.results}>
      {results.length ? (
        <ul>
          {results.map((result, index) => (
            <li key={index}>{result.title}</li>
          ))}
        </ul>
      ) : (
        <p>No issues have been found.</p>
      )}
    </div>
  );
};

export default Results;
