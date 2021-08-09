import { FunctionalComponent, h } from 'preact';
import style from './code-wrap.css';

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Props {
  text: string;
  emphasize?: string;
  emphasizeAll?: boolean;
}

const CodeWrap: FunctionalComponent<Props> = props => {
  const { text, emphasize, emphasizeAll } = props;
  let parts = [{ text, emphasize: false }];

  if (emphasize) {
    const expression = new RegExp(escapeRegExp(emphasize), 'g');
    let match: RegExpExecArray | null;
    let position = 0;

    parts = [];

    while ((match = expression.exec(text))) {
      const pre = text.substring(position, match.index);
      if (pre) {
        parts.push({ emphasize: false, text: pre });
      }
      parts.push({ emphasize: true, text: match[0] });
      position = match.index + match[0].length;

      if (!emphasizeAll) {
        break;
      }
    }

    parts.push({ emphasize: false, text: text.substring(position) });

    parts = parts.filter(part => part.text);
  }

  return (
    <span class={style.code}>
      {parts.map((part, index, arr) => (
        <code key={index} class={part.emphasize ? style.emphasize : undefined}>
          {part.text}
        </code>
      ))}
    </span>
  );
};

export default CodeWrap;
