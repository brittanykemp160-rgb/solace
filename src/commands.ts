// Slash commands typed into the message box (e.g. `/model kimi`).
// Definitions live here; App.tsx `runCommand` carries them out.

import { MODELS } from './data/models';

export interface CommandOption {
  value: string;
  label: string;
  hint?: string;
}

export type CommandGroup = 'Session' | 'Model & folder' | 'App' | 'Coming soon';

export interface Command {
  name: string;
  aliases?: string[];
  /** Argument hint shown after the name: `<required>` or `[optional]`. */
  args?: string;
  description: string;
  group: CommandGroup;
  options?: CommandOption[];
  soon?: boolean;
}

export const COMMANDS: Command[] = [
  // Session
  { name: 'new', description: 'Start a new session', group: 'Session' },
  { name: 'clear', aliases: ['reset'], description: 'Start fresh, keeping this folder and model', group: 'Session' },
  { name: 'rename', args: '<title>', description: 'Rename this session', group: 'Session' },
  { name: 'retry', description: 'Regenerate the last reply', group: 'Session' },
  { name: 'stop', description: 'Stop the reply in progress', group: 'Session' },
  { name: 'copy', description: 'Copy the last reply', group: 'Session' },
  { name: 'export', description: 'Save this session as Markdown', group: 'Session' },
  { name: 'delete', description: 'Delete this session', group: 'Session' },

  // Model & folder
  {
    name: 'model',
    args: '[name]',
    description: 'Switch model',
    group: 'Model & folder',
    options: MODELS.map((m) => ({ value: m.id, label: m.name, hint: m.description })),
  },
  { name: 'models', description: 'Browse available models', group: 'Model & folder' },
  { name: 'folder', aliases: ['cd'], args: '[path]', description: 'Choose the project folder', group: 'Model & folder' },

  // App
  { name: 'usage', description: "Show today's token usage", group: 'App' },
  { name: 'plans', aliases: ['upgrade'], description: 'See plans and upgrade', group: 'App' },
  {
    name: 'theme',
    args: '[light|dark|system]',
    description: 'Change the theme',
    group: 'App',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System', hint: 'Follow your OS setting' },
    ],
  },
  { name: 'sidebar', description: 'Show or hide the sidebar', group: 'App' },
  { name: 'settings', aliases: ['config'], description: 'Open settings', group: 'App' },
  { name: 'login', aliases: ['signin'], description: 'Sign in to your Solace account', group: 'App' },
  { name: 'logout', aliases: ['signout'], description: 'Sign out', group: 'App' },
  { name: 'help', aliases: ['commands', 'shortcuts'], description: 'Show all commands and shortcuts', group: 'App' },

  // Placeholders
  { name: 'compact', description: 'Summarize the conversation to free up context', group: 'Coming soon', soon: true },
  { name: 'init', description: 'Create a SOLACE.md with project instructions', group: 'Coming soon', soon: true },
  { name: 'review', description: 'Review changes in the current folder', group: 'Coming soon', soon: true },
];

export function findCommand(name: string): Command | undefined {
  const n = name.toLowerCase();
  return COMMANDS.find((c) => c.name === n || c.aliases?.includes(n));
}

export interface ParsedSlash {
  name: string;
  arg: string;
  hasSpace: boolean;
}

/** Parses `/name arg…`. Returns null for normal messages (including multi-line). */
export function parseSlash(text: string): ParsedSlash | null {
  if (!text.startsWith('/') || text.includes('\n')) return null;
  const body = text.slice(1);
  const sp = body.indexOf(' ');
  return {
    name: (sp < 0 ? body : body.slice(0, sp)).toLowerCase(),
    arg: sp < 0 ? '' : body.slice(sp + 1).trim(),
    hasSpace: sp >= 0,
  };
}

export interface CommandLike {
  name: string;
  aliases?: string[];
}

/** Commands from `list` matching what's typed after `/`, best matches first. */
export function rankCommands<T extends CommandLike>(list: T[], query: string): T[] {
  const q = query.toLowerCase();
  if (!q) return list;
  const score = (c: T) => {
    if (c.name.startsWith(q)) return 0;
    if (c.aliases?.some((a) => a.startsWith(q))) return 1;
    if (c.name.includes(q)) return 2;
    return -1;
  };
  return list
    .map((c) => [c, score(c)] as const)
    .filter(([, s]) => s >= 0)
    .sort((a, b) => a[1] - b[1])
    .map(([c]) => c);
}

/** Desktop commands matching what's typed after `/`, best matches first. */
export const matchCommands = (query: string): Command[] => rankCommands(COMMANDS, query);
