// Format utility tests

import { formatTokens, truncate, pluralize, capitalize } from '../lib/format';

describe('formatTokens', () => {
  it('formats millions', () => {
    expect(formatTokens(5000000)).toBe('5M');
  });

  it('formats thousands', () => {
    expect(formatTokens(1500)).toBe('2K');
  });

  it('formats small numbers', () => {
    expect(formatTokens(500)).toBe('500');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('hello world', 8)).toBe('hello w…');
  });

  it('keeps short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
});

describe('pluralize', () => {
  it('pluralizes correctly', () => {
    expect(pluralize(1, 'file')).toBe('1 file');
    expect(pluralize(2, 'file')).toBe('2 files');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
