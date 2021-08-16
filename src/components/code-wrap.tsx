import { FunctionalComponent, h } from 'preact';
import style from './code-wrap.css';

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface CodePart {
  emphasize: boolean;
  text: string;
}

function splitCodeParts(text: string, expression: RegExp | null | undefined) {
  let parts: CodePart[] = [{ text, emphasize: false }];

  if (expression) {
    let match: RegExpExecArray | null;
    let position = 0;

    parts = [];

    while ((match = expression.exec(text))) {
      const [full, capture] = match;
      const pre = text.substring(position, match.index);

      if (pre) {
        parts.push({ emphasize: false, text: pre });
      }

      if (capture) {
        const index = full.indexOf(capture);
        if (index !== 0) {
          parts.push({ emphasize: false, text: full.substring(0, index) });
        }
        parts.push({ emphasize: true, text: capture });

        if (index + capture.length < full.length) {
          parts.push({ emphasize: false, text: full.substring(index + capture.length) });
        }
      } else {
        parts.push({ emphasize: true, text: full });
      }

      position = match.index + full.length;

      if (!expression.flags.includes('g')) {
        break;
      }
    }

    if (position < text.length) {
      parts.push({ emphasize: false, text: text.substring(position) });
    }

    parts = parts.filter(part => part.text);
  }

  return parts;
}

function mergeCodeParts(parts: CodePart[]) {
  const merged: CodePart[] = [];
  let prev: CodePart | undefined;

  for (const part of parts) {
    if (prev?.emphasize === part.emphasize) {
      prev.text += part.text;
    } else {
      merged.push(part);
      prev = part;
    }
  }

  return merged;
}

interface Props {
  text: string;
  emphasize?: string | RegExp;
}

const CodeWrap: FunctionalComponent<Props> = props => {
  const { text, emphasize } = props;
  const expression = emphasize
    ? typeof emphasize === 'string'
      ? new RegExp(escapeRegExp(emphasize))
      : emphasize
    : null;

  const parts = mergeCodeParts(splitCodeParts(text, expression));

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
