import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repo / install root. The bundle lives in `dist-cli/`, one level down. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Per-user config folder: ~/.config/solace, %APPDATA%\Solace, ~/Library/Application Support/Solace. */
export function configDir(): string {
  if (process.env.SOLACE_CONFIG_DIR) return process.env.SOLACE_CONFIG_DIR;
  const home = os.homedir();
  if (process.platform === 'win32') return path.join(process.env.APPDATA ?? path.join(home, 'AppData', 'Roaming'), 'Solace');
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Application Support', 'Solace');
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(home, '.config'), 'solace');
}

/** `/home/me/code/app` → `~/code/app`. */
export function tildify(p: string): string {
  const home = os.homedir();
  return p === home ? '~' : p.startsWith(home + path.sep) ? '~' + p.slice(home.length) : p;
}

/** Resolves `~`, relative paths (against `base`) and quotes. */
export function resolveFolder(input: string, base: string): string {
  let p = input.trim().replace(/^["']|["']$/g, '');
  if (p === '~' || p.startsWith('~/') || p.startsWith('~\\')) p = path.join(os.homedir(), p.slice(1));
  return path.resolve(base, p);
}
