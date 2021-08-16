import { FunctionalComponent, h } from 'preact';
import style from './style.css';

interface Props {
  class?: string;
  radius: number;
  stroke: number;
  value: number;
  text?: string;
}

const ColorGrading = new Map([
  [0.8, style.good],
  [0.6, style.fair],
  [0, style.bad],
]);

const Score: FunctionalComponent<Props> = (props: Props) => {
  const { radius, stroke, value, text } = props;
  const width = radius * 2;
  const height = radius * 2;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - value * circumference;
  const colorCss = Array.from(ColorGrading.entries()).find(([minScore, css]) => value >= minScore)?.[1] ?? style.bad;

  return (
    <svg width={width} height={height} class={[props.class, colorCss].filter(Boolean).join(' ')}>
      <circle
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        opacity="0.1"
      />
      <circle
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', strokeDashoffset: offset }}
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text x="50%" y="50%" strokeWidth={0} text-anchor="middle" dy="0.35em" title={`${(value * 100).toFixed(2)}`}>
        {text}
      </text>
    </svg>
  );
};

export default Score;
