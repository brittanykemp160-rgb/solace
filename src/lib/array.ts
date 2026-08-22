// Array utilities

export const chunk = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

export const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const sample = <T>(arr: T[]): T | undefined => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const groupBy = <T, K extends string | number>(
  arr: T[],
  fn: (item: T) => K
): Record<K, T[]> => {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
};
