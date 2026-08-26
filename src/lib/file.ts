// File utilities

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

export const readFile = (path: string): string | null => {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
};

export const writeFile = (path: string, content: string): boolean => {
  try {
    writeFileSync(path, content);
    return true;
  } catch {
    return false;
  }
};

export const listFiles = (dir: string, recursive = false): string[] => {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isFile()) {
      files.push(path);
    } else if (stat.isDirectory() && recursive) {
      files.push(...listFiles(path, true));
    }
  }

  return files;
};

export const getExtension = (path: string): string => extname(path);
export const getBasename = (path: string): string => basename(path);
export const getDirname = (path: string): string => dirname(path);
