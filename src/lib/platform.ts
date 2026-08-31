// Platform detection

import { platform, arch, release, homedir, tmpdir } from 'os';

export const OS = platform();
export const ARCH = arch();
export const IS_WINDOWS = OS === 'win32';
export const IS_MAC = OS === 'darwin';
export const IS_LINUX = OS === 'linux';

export const HOME = homedir();
export const TMP = tmpdir();
export const VERSION = release();

export const getConfigDir = (): string => {
  if (IS_WINDOWS) {
    return process.env.APPDATA || HOME;
  }
  if (IS_MAC) {
    return `${HOME}/Library/Application Support`;
  }
  return process.env.XDG_CONFIG_HOME || `${HOME}/.config`;
};

export const getDataDir = (): string => {
  if (IS_WINDOWS) {
    return process.env.LOCALAPPDATA || HOME;
  }
  if (IS_MAC) {
    return `${HOME}/Library/Application Support`;
  }
  return process.env.XDG_DATA_HOME || `${HOME}/.local/share`;
};
