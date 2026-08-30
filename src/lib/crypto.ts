// Crypto utilities

import { createHash, randomBytes } from 'crypto';

export const hash = (data: string, algorithm: 'sha256' | 'md5' = 'sha256'): string => {
  return createHash(algorithm).update(data).digest('hex');
};

export const randomId = (length = 16): string => {
  return randomBytes(length).toString('hex').slice(0, length);
};

export const randomToken = (): string => {
  return randomBytes(32).toString('base64url');
};
