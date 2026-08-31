// Thin wrapper around the preload bridge so the UI also runs in a plain
// browser (`npm run dev:web`) where `window.solace` doesn't exist.

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  /** Folder passed on the command line: `solace desktop <folder>`. */
  initialFolder: string | null;
}

interface SolaceBridge {
  platform: string;
  getInfo: () => Promise<AppInfo>;
  pickFolder: () => Promise<string | null>;
  saveText: (defaultName: string, content: string) => Promise<string | null>;
  onOpenFolder: (cb: (folder: string) => void) => () => void;
  openExternal: (url: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
}

declare global {
  interface Window {
    solace?: SolaceBridge;
  }
}

const bridge = typeof window !== 'undefined' ? window.solace : undefined;

export const native = {
  isDesktop: !!bridge,
  platform: bridge?.platform ?? 'web',
  getInfo: async (): Promise<AppInfo> =>
    bridge ? bridge.getInfo() : { name: 'Solace', version: '0.1.0', platform: 'web', initialFolder: null },
  pickFolder: async () => (bridge ? bridge.pickFolder() : '~/projects/example'),
  saveText: async (defaultName: string, content: string): Promise<string | null> => {
    if (bridge) return bridge.saveText(defaultName, content);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }));
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(a.href);
    return defaultName;
  },
  onOpenFolder: (cb: (folder: string) => void) => (bridge ? bridge.onOpenFolder(cb) : () => {}),
  openExternal: async (url: string) => (bridge ? bridge.openExternal(url) : void window.open(url, '_blank')),
  setTheme: (theme: 'light' | 'dark') => bridge?.setTheme(theme),
};

export { uid, formatTokens, shortPath } from './format';
