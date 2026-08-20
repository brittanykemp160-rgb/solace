// Small helpers shared by the desktop app and the terminal app (no DOM or Node APIs).

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const formatTokens = (n: number): string => {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
};

export const shortPath = (p: string): string => {
  const parts = p.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? p;
};

export const truncate = (s: string, max: number): string =>
  s.length <= max ? s : s.slice(0, max - 1) + '…';

export const pluralize = (n: number, word: string): string =>
  `${n} ${word}${n === 1 ? '' : 's'}`;

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const kebabCase = (s: string): string =>
  s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
