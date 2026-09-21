// Terminal colours, taken from the desktop app's dark theme (src/styles.css).
// Most terminals have a dark background; text colours fall back to the terminal's own.

export const c = {
  accent: '#5fbfa6',
  muted: 'gray',
  border: '#3d3a35',
  borderFocus: '#5fbfa6',
  user: '#d6d3cc',
  code: '#e0b97a',
  error: '#e07a6f',
  warn: '#e0b97a',
  success: '#5fbfa6',
  // Model logo colours, as used in the desktop badge
  deepseek: '#4D6BFE',
  kimi: '#1783FF',
  qwen: '#6366F1',
} as const;

/** Sun-on-horizon mark, matching the desktop logo. */
export const LOGO = '◓';

/** Terminal width breakpoints */
export const BREAKPOINTS = {
  narrow: 60,
  normal: 80,
  wide: 120,
} as const;
