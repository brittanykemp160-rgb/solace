// Version info

import { readFileSync } from 'fs';
import { join, dirname } from 'path';

let version: string | null = null;

export const getVersion = (): string => {
  if (version) return version;

  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
    version = pkg.version || '0.0.0';
  } catch {
    version = '0.0.0';
  }

  return version;
};

export const printVersion = () => {
  console.log(`solace v${getVersion()}`);
};
