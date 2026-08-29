// Input validation helpers

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidModelId = (id: string): boolean =>
  /^[a-z0-9-]+$/.test(id) && id.length > 0 && id.length <= 64;

export const sanitizeInput = (input: string): string =>
  input.trim().slice(0, 10000);

export const isNonEmpty = (s: string | null | undefined): s is string =>
  typeof s === 'string' && s.trim().length > 0;
