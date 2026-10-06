// Slash commands for the terminal app. Same style and names as the desktop
// app (src/commands.ts) where they make sense in a terminal.
// app.tsx `runCommand` carries them out.

import { MODELS } from '../data/models';
import { rankCommands, type CommandOption } from '../commands';

export type CliGroup = 'Session' | 'Model & folder' | 'Account' | 'App' | 'Coming soon';

export interface CliCommand {
  name: string;
  aliases?: string[];
  args?: string;
  description: string;
  group: CliGroup;
  /** Choices shown after `/name `. A function for lists that change (e.g. saved sessions). */
  options?: CommandOption[] | (() => CommandOption[]);
  soon?: boolean;
}

export const CLI_GROUPS: CliGroup[] = ['Session', 'Model & folder', 'Account', 'App', 'Coming soon'];

export function makeCommands(sessionOptions: () => CommandOption[]): CliCommand[] {
  return [
    // Session
    { name: 'new', description: 'Start a new session', group: 'Session' },
    { name: 'clear', aliases: ['reset'], description: 'Clear the screen and start fresh', group: 'Session' },
    { name: 'resume', aliases: ['history'], args: '[session]', description: 'Pick up a previous session', group: 'Session', options: sessionOptions },
    { name: 'retry', description: 'Regenerate the last reply', group: 'Session' },
    { name: 'export', args: '[file]', description: 'Save this session as Markdown', group: 'Session' },

    // Model & folder
    {
      name: 'model',
      args: '[name]',
      description: 'Switch model',
      group: 'Model & folder',
      options: MODELS.map((m) => ({ value: m.id, label: m.name, hint: m.description })),
    },
    { name: 'models', description: 'List available models', group: 'Model & folder' },
    { name: 'folder', aliases: ['cd'], args: '[path]', description: 'Show or change the project folder', group: 'Model & folder' },

    // Account
    { name: 'usage', description: "Today's token usage", group: 'Account' },
    { name: 'plans', aliases: ['upgrade'], description: 'See plans and upgrade', group: 'Account' },
    { name: 'login', aliases: ['signin'], description: 'Sign in on the Solace website', group: 'Account' },
    { name: 'logout', aliases: ['signout'], description: 'Sign out', group: 'Account' },

    // App
    { name: 'desktop', description: 'Open this folder in the Solace desktop app', group: 'App' },
    { name: 'config', aliases: ['settings'], description: 'Show settings and where they are saved', group: 'App' },
    { name: 'help', aliases: ['commands', '?'], description: 'Show all commands and shortcuts', group: 'App' },
    { name: 'exit', aliases: ['quit', 'q'], description: 'Quit Solace', group: 'App' },

    // Placeholders
    { name: 'compact', description: 'Summarize the conversation to free up context', group: 'Coming soon', soon: true },
    { name: 'init', description: 'Create a SOLACE.md with project instructions', group: 'Coming soon', soon: true },
    { name: 'review', description: 'Review changes in the current folder', group: 'Coming soon', soon: true },
  ];
}

export const optionsOf = (cmd: CliCommand): CommandOption[] =>
  typeof cmd.options === 'function' ? cmd.options() : cmd.options ?? [];

export function findCli(list: CliCommand[], name: string): CliCommand | undefined {
  const n = name.toLowerCase();
  return list.find((c) => c.name === n || c.aliases?.includes(n));
}

export const matchCli = (list: CliCommand[], query: string) => rankCommands(list, query);

/** Options whose value or label match the typed argument. */
export function matchOptions(opts: CommandOption[], query: string): CommandOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return opts;
  return opts.filter((o) => o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q));
}
