import { Fragment, FunctionalComponent, h } from 'preact';
import { escapeRegExp } from '../lib/string-util';
import style from './code-wrap.css';

interface CodePart {
  emphasize: boolean;
  text: string;
}

function getFirstAndBestMatch(text: string, expressions: RegExp[]) {
  const matches = expressions
    .map(exp => {
      return { expression: exp, match: new RegExp(exp).exec(text)! };
    })
    .filter(match => match.match)
    .sort((m1, m2) => {
      let val = m1.match.index - m2.match.index;
      if (val === 0) {
        val = m2.match[0].length - m1.match[0].length;
      }
      return val;
    });
  return matches.length ? matches[0] : null;
}

function splitCodeParts(text: string, expressions: RegExp[]) {
  let parts: CodePart[] = [{ text, emphasize: false }];

  let workingExpressions = [...expressions];
  let remaining = text;
  let bestMatch: {
    expression: RegExp;
    match: RegExpExecArray;
  } | null;

  parts = [];

  while ((bestMatch = getFirstAndBestMatch(remaining, workingExpressions))) {
    const { expression, match } = bestMatch;
    const [full, capture] = match;
    const pre = remaining.substring(0, match.index);

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

    remaining = remaining.substring(match.index + full.length);

    if (!expression.flags.includes('g')) {
      workingExpressions = workingExpressions.filter(exp => exp !== expression);
    }
  }

  if (remaining.length) {
    parts.push({ emphasize: false, text: remaining });
  }

  parts = parts.filter(part => part.text);

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
  emphasize?: string | RegExp | Array<string | RegExp>;
}

const CodeWrap: FunctionalComponent<Props> = props => {
  const { text, emphasize } = props;
  const emphasis = emphasize instanceof Array ? emphasize : [emphasize];
  const expressions = emphasis
    .map(em => (em ? (typeof em === 'string' ? new RegExp(escapeRegExp(em)!) : em) : null)!)
    .filter(Boolean);

  const parts = mergeCodeParts(splitCodeParts(text, expressions));

  return (
    <code class={style.code}>
      {parts.map((part, index) => (
        <Fragment key={index}>{part.emphasize ? <strong>{part.text}</strong> : part.text}</Fragment>
      ))}
    </code>
  );
};

export default CodeWrap;
