// Desktop app launcher

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { platform } from 'os';

const getDesktopPath = (): string | null => {
  const os = platform();

  const paths: Record<string, string[]> = {
    darwin: [
      '/Applications/Solace.app/Contents/MacOS/Solace',
      join(process.env.HOME || '', 'Applications/Solace.app/Contents/MacOS/Solace'),
    ],
    linux: [
      '/usr/bin/solace-desktop',
      '/opt/Solace/solace-desktop',
      join(process.env.HOME || '', '.local/bin/solace-desktop'),
    ],
    win32: [
      join(process.env.LOCALAPPDATA || '', 'Solace/Solace.exe'),
      join(process.env.PROGRAMFILES || '', 'Solace/Solace.exe'),
    ],
  };

  for (const p of paths[os] || []) {
    if (existsSync(p)) return p;
  }

  return null;
};

export const launchDesktop = (folder?: string): void => {
  const path = getDesktopPath();

  if (!path) {
    console.error('Desktop app not found. Download from https://solace.dev');
    process.exit(1);
  }

  const args = folder ? [folder] : [];
  spawn(path, args, { detached: true, stdio: 'ignore' }).unref();
};
