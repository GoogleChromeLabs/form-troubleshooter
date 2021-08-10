import { FunctionalComponent, h } from 'preact';
import { truncate } from '../../lib/string-util';
import Results from '../../routes/results';
import AuditSummary from '../summary';
import style from './style.css';

interface Props {
  title: string;
  auditUrl: string;
  auditResults: AuditDetails;
}

const Report: FunctionalComponent<Props> = (props: Props) => {
  const { auditResults, auditUrl, title } = props;

  return (
    <div class={style.report}>
      <h1>{title}</h1>
      <p class={style.url}>{truncate(auditUrl, 100)}</p>
      <AuditSummary
        className={style.reportScore}
        score={auditResults.score}
        recommendations={auditResults.errors}
        commonMistakes={auditResults.warnings}
      />
      <h2>Recommendations</h2>
      <div class={style.results}>
        <Results results={auditResults.errors} />
      </div>
      <h2>Common mistakes</h2>
      <div class={style.results}>
        <Results results={auditResults.warnings} />
      </div>
    </div>
  );
};

export default Report;
