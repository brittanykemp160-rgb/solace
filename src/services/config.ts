// User configuration service

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.config', 'solace');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface UserConfig {
  defaultModelId?: string;
  theme?: 'light' | 'dark' | 'system';
  telemetry?: boolean;
}

let config: UserConfig = {};

export const loadConfig = (): UserConfig => {
  if (existsSync(CONFIG_FILE)) {
    try {
      config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {
      config = {};
    }
  }
  return config;
};

export const saveConfig = (updates: Partial<UserConfig>) => {
  config = { ...config, ...updates };

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export const getConfig = () => config;
export const getConfigValue = <K extends keyof UserConfig>(key: K): UserConfig[K] => config[key];
