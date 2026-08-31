// Environment helpers

export const isDev = () => process.env.NODE_ENV === 'development';
export const isProd = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

export const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value !== undefined) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env var: ${key}`);
};

export const getEnvNumber = (key: string, fallback?: number): number => {
  const value = process.env[key];
  if (value !== undefined) {
    const num = parseInt(value, 10);
    if (!isNaN(num)) return num;
  }
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env var: ${key}`);
};
