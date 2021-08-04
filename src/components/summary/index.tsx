import { FunctionalComponent, h } from 'preact';
import style from './style.css';
import Score from './score';

interface Props {
  score: number;
  recommendations: any[];
  commonMistakes: any[];
}

const AuditSummary: FunctionalComponent<Props> = (props: Props) => {
  const { score, recommendations, commonMistakes } = props;

  return (
    <div class={style.summary}>
      <Score class={style.score} radius={50} stroke={8} value={score} text={(score * 100).toFixed(0)} />
      <div class={style.result}>
        <dl>
          <dt class={style.recommended}>{recommendations.length}</dt>
          <dd class={style.recommended}>recommendations</dd>
          <dt class={style.other}>{commonMistakes.length}</dt>
          <dd class={style.other}>common mistakes</dd>
        </dl>
      </div>
    </div>
  );
};

export default AuditSummary;
