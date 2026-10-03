import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import { c } from '../theme';
import { highlightLine } from './highlight';

// Minimal Markdown → Ink renderer: headings, lists, quotes, fenced code
// (highlighted), inline `code`, **bold**, *italic* and [links](url).
// Unclosed fences (while a reply is still streaming) render as code.

type Block =
  | { kind: 'code'; lang: string; lines: string[] }
  | { kind: 'heading'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'item'; bullet: string; text: string; indent: number }
  | { kind: 'para'; text: string }
  | { kind: 'rule' }
  | { kind: 'blank' };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^\s*```\s*([\w+#.-]*)/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) code.push(lines[i++]);
      blocks.push({ kind: 'code', lang: fence[1] ?? '', lines: code });
      continue;
    }
    let m: RegExpMatchArray | null;
    if (!line.trim()) blocks.push({ kind: 'blank' });
    else if ((m = line.match(/^#{1,6}\s+(.*)$/))) blocks.push({ kind: 'heading', text: m[1] });
    else if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) blocks.push({ kind: 'rule' });
    else if ((m = line.match(/^>\s?(.*)$/))) blocks.push({ kind: 'quote', text: m[1] });
    else if ((m = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)))
      blocks.push({ kind: 'item', indent: Math.floor(m[1].length / 2), bullet: /\d/.test(m[2]) ? m[2] : '•', text: m[3] });
    else blocks.push({ kind: 'para', text: line });
  }
  // Collapse runs of blank lines and trim the ends.
  return blocks.filter((b, i, a) => b.kind !== 'blank' || (i > 0 && i < a.length - 1 && a[i - 1].kind !== 'blank'));
}

export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const t = m[0];
    if (m[1]) parts.push(<Text key={k++} color={c.code}>{t.slice(1, -1)}</Text>);
    else if (m[2]) parts.push(<Text key={k++} bold>{t.slice(2, -2)}</Text>);
    else if (m[3]) parts.push(<Text key={k++} italic>{t.slice(1, -1)}</Text>);
    else {
      const [, label, url] = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      parts.push(
        <Text key={k++}>
          <Text underline color={c.accent}>{label}</Text>
          <Text color={c.muted}> ({url})</Text>
        </Text>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Text>{parts}</Text>;
}

function CodeBlock({ lang, lines }: { lang: string; lines: string[] }) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={c.border} paddingX={1} marginY={0}>
      {lang ? <Text color={c.muted}>{lang}</Text> : null}
      {lines.length === 0 ? <Text> </Text> : null}
      {lines.map((line, i) => (
        <Text key={i}>
          {highlightLine(line, lang).map((t, j) => (
            <Text key={j} color={t.color}>
              {t.text}
            </Text>
          ))}
          {line ? '' : ' '}
        </Text>
      ))}
    </Box>
  );
}

export function Markdown({ text }: { text: string }) {
  const blocks = parse(text);
  return (
    <Box flexDirection="column">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'code':
            return <CodeBlock key={i} lang={b.lang} lines={b.lines} />;
          case 'heading':
            return (
              <Text key={i} bold>
                <Inline text={b.text} />
              </Text>
            );
          case 'quote':
            return (
              <Text key={i} color={c.muted}>
                │ <Inline text={b.text} />
              </Text>
            );
          case 'item':
            return (
              <Box key={i} paddingLeft={b.indent * 2}>
                <Text color={c.muted}>{b.bullet} </Text>
                <Inline text={b.text} />
              </Box>
            );
          case 'rule':
            return (
              <Text key={i} color={c.border}>
                ────────────────
              </Text>
            );
          case 'blank':
            return <Text key={i}> </Text>;
          default:
            return <Inline key={i} text={b.text} />;
        }
      })}
    </Box>
  );
}
