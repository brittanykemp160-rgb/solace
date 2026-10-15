// Validation utility tests

import { isValidEmail, isValidModelId, isNonEmpty, sanitizeInput } from '../lib/validation';

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@no.com')).toBe(false);
  });
});

describe('isValidModelId', () => {
  it('validates correct model ids', () => {
    expect(isValidModelId('deepseek-v4')).toBe(true);
  });

  it('rejects invalid model ids', () => {
    expect(isValidModelId('')).toBe(false);
    expect(isValidModelId('has spaces')).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('checks for non-empty strings', () => {
    expect(isNonEmpty('hello')).toBe(true);
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('  ')).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('trims and limits input', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});
