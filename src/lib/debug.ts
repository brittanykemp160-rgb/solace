// Debug utilities

const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

export const debug = (...args: unknown[]) => {
  if (DEBUG) {
    console.log('[debug]', ...args);
  }
};

export const debugTime = (label: string) => {
  if (DEBUG) {
    console.time(`[debug] ${label}`);
  }
  return () => {
    if (DEBUG) {
      console.timeEnd(`[debug] ${label}`);
    }
  };
};

export const isDebug = () => DEBUG;
