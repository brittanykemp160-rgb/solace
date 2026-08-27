// JSON utilities

export const parse = <T>(json: string, fallback?: T): T | undefined => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const stringify = (value: unknown, pretty = false): string => {
  return JSON.stringify(value, null, pretty ? 2 : undefined);
};

export const isJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};
