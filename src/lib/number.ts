// Number utilities

export const clamp = (n: number, min: number, max: number): number => {
  return Math.min(Math.max(n, min), max);
};

export const round = (n: number, decimals = 0): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
};

export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const percentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return round((value / total) * 100, 2);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${round(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
};
