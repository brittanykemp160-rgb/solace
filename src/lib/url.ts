// URL utilities

export const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

export const buildUrl = (base: string, path: string, params?: Record<string, string>): string => {
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getQueryParam = (url: string, param: string): string | null => {
  const parsed = parseUrl(url);
  return parsed?.searchParams.get(param) ?? null;
};
