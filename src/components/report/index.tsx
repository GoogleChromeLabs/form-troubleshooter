import { FunctionalComponent, h } from 'preact';
import { truncate } from '../../lib/string-util';
import Results from '../../routes/results';
import AuditSummary from '../summary';
import style from './style.css';

interface Props {
  title: string;
  auditUrl: string;
  auditResults: AuditDetails;
  icon?: string;
}

const Report: FunctionalComponent<Props> = (props: Props) => {
  const { auditResults, auditUrl, title, icon } = props;

  return (
    <div class={style.report}>
      <div class={style.title}>
        {icon ? <img class={style.icon} src={icon} alt="Webpage icon" /> : null}
        <div>
          <h1>{title}</h1>
          <p class={style.url}>{truncate(auditUrl, 100)}</p>
        </div>
      </div>
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
