import type { Session, ThemePref } from '../types';
import { DEFAULT_MODEL_ID, isModelId } from '../data/models';

// Local persistence for sessions and preferences.
// TODO: move to files in the user's app-data folder via the main process
// (localStorage is fine while the design settles).

const KEY_SESSIONS = 'solace.sessions.v1';
const KEY_PREFS = 'solace.prefs.v1';

export interface Prefs {
  theme: ThemePref;
  defaultModelId: string;
  sendWithEnter: boolean;
  telemetry: boolean;
  sidebarOpen: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  defaultModelId: DEFAULT_MODEL_ID,
  sendWithEnter: true,
  telemetry: false,
  sidebarOpen: true,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

// Older saves may reference models that no longer exist.
const validModel = (id: string) => (isModelId(id) ? id : DEFAULT_MODEL_ID);

export const loadSessions = (): Session[] =>
  read<Session[]>(KEY_SESSIONS, []).map((s) => ({ ...s, modelId: validModel(s.modelId) }));
export const saveSessions = (s: Session[]) =>
  write(KEY_SESSIONS, s.map((x) => ({ ...x, messages: x.messages.map((m) => ({ ...m, streaming: false })) })));

export const loadPrefs = (): Prefs => {
  const p = { ...DEFAULT_PREFS, ...read<Partial<Prefs>>(KEY_PREFS, {}) };
  return { ...p, defaultModelId: validModel(p.defaultModelId) };
};
export const savePrefs = (p: Prefs) => write(KEY_PREFS, p);
