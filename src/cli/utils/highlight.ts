// Small, dependency-free syntax highlighter for code blocks in the terminal.
// Good enough for the common languages; not a full parser.

export interface Token {
  text: string;
  color?: string;
  dim?: boolean;
}

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue new class extends ' +
    'import from export default as async await try catch finally throw typeof instanceof in of void yield ' +
    'interface type enum implements public private protected readonly static abstract declare namespace ' +
    'def lambda pass with elif except raise global nonlocal and or not is None True False self ' +
    'fn mut pub impl struct trait use mod match loop where crate super ' +
    'func package go defer chan select range map ' +
    'int float double char bool string void long short unsigned signed auto ' +
    'true false null undefined nil this echo then fi esac done local'
  ).split(' '),
);

const COMMENT_HASH = new Set(['py', 'python', 'sh', 'bash', 'zsh', 'fish', 'shell', 'rb', 'ruby', 'yaml', 'yml', 'toml', 'r', 'perl', 'pl', 'dockerfile', 'makefile', 'ini', 'conf']);

const COLORS = {
  keyword: '#c792ea',
  string: '#a5d6a7',
  number: '#f78c6c',
  comment: 'gray',
  fn: '#82aaff',
  type: '#ffcb6b',
};

export function highlightLine(line: string, lang: string): Token[] {
  const l = lang.toLowerCase();
  const hashComments = COMMENT_HASH.has(l);
  const out: Token[] = [];
  const re = hashComments
    ? /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)/g
    : /(\/\/.*$|\/\*.*?\*\/|<!--.*?-->)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)/g;

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index) });
    const [text, comment, str, num, word] = m;
    if (comment) out.push({ text, color: COLORS.comment });
    else if (str) out.push({ text, color: COLORS.string });
    else if (num) out.push({ text, color: COLORS.number });
    else if (word) {
      if (KEYWORDS.has(word)) out.push({ text, color: COLORS.keyword });
      else if (line[re.lastIndex] === '(') out.push({ text, color: COLORS.fn });
      else if (/^[A-Z][a-z]/.test(word)) out.push({ text, color: COLORS.type });
      else out.push({ text });
    }
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}
