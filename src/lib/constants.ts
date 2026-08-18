// App-wide constants

export const APP_NAME = 'Solace';
export const APP_VERSION = '0.1.0-beta';

export const MAX_MESSAGE_LENGTH = 100000;
export const MAX_SESSIONS = 100;
export const MAX_MESSAGES_PER_SESSION = 1000;

export const API_TIMEOUT = 30000;
export const STREAM_TIMEOUT = 120000;

export const TOKEN_LIMITS = {
  free: 5_000_000,
  plus: 100_000_000,
  unlimited: Infinity,
} as const;

export const SUPPORTED_LANGUAGES = [
  'typescript', 'javascript', 'python', 'rust', 'go',
  'java', 'cpp', 'c', 'csharp', 'ruby', 'php', 'swift',
  'kotlin', 'scala', 'bash', 'sql', 'html', 'css', 'json',
  'yaml', 'markdown', 'plaintext',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
