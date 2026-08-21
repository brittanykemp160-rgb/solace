// String utilities

export const camelCase = (s: string): string =>
  s.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());

export const snakeCase = (s: string): string =>
  s.replace(/[A-Z]/g, c => '_' + c.toLowerCase()).replace(/^_/, '');

export const pascalCase = (s: string): string => {
  const camel = camelCase(s);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const wordCount = (s: string): number =>
  s.trim().split(/\s+/).filter(Boolean).length;

export const lineCount = (s: string): number =>
  s.split('\n').length;

export const stripAnsi = (s: string): string =>
  s.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
