import fs from 'node:fs';
import path from 'node:path';
import type { Session } from '../types';
import { DEFAULT_MODEL_ID, isModelId } from '../data/models';
import { configDir } from './paths';

// Terminal storage: plain JSON files in the user's config folder.
//   <config>/config.json            preferences
//   <config>/sessions/<id>.json     one file per session
// Separate from the desktop app's storage for now.
// TODO: share history with the desktop app once its storage moves to files.

export interface CliPrefs {
  defaultModelId: string;
}

const DEFAULTS: CliPrefs = { defaultModelId: DEFAULT_MODEL_ID };

const configFile = () => path.join(configDir(), 'config.json');
const sessionsDir = () => path.join(configDir(), 'sessions');

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

function writeJson(file: string, data: unknown): void {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  } catch {
    // Storage is best-effort: a read-only home folder shouldn't break the chat.
  }
}

export function loadPrefs(): CliPrefs {
  const p = { ...DEFAULTS, ...readJson<Partial<CliPrefs>>(configFile()) };
  if (!isModelId(p.defaultModelId)) p.defaultModelId = DEFAULT_MODEL_ID;
  return p;
}

export function savePrefs(prefs: CliPrefs): void {
  writeJson(configFile(), prefs);
}

export function configPath(): string {
  return configFile();
}

export function saveSession(s: Session): void {
  if (!s.messages.length) return;
  writeJson(path.join(sessionsDir(), `${s.id}.json`), { ...s, messages: s.messages.map(({ streaming: _, ...m }) => m) });
}

/** Most recent first. */
export function listSessions(limit = 20): Session[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(sessionsDir()).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  return files
    .map((f) => readJson<Session>(path.join(sessionsDir(), f)))
    .filter((s): s is Session => !!s && Array.isArray(s.messages))
    .map((s) => (isModelId(s.modelId) ? s : { ...s, modelId: DEFAULT_MODEL_ID }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}
