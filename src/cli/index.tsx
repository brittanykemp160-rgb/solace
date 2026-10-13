import { render } from 'ink';
import { modelById } from '../data/models';
import { App } from './app';
import * as api from './api';
import { loadPrefs } from './storage';
import { checkForUpdates } from '../services/update';

// Entry points for the terminal app. bin/solace.cjs picks one:
//   solace [folder]          → startChat
//   solace ask "question"    → askOnce

export async function startChat({ version, folder }: { version: string; folder: string }): Promise<void> {
  // Check for updates in background (non-blocking)
  checkForUpdates().catch(() => {});

  const app = render(<App version={version} initialFolder={folder} />, {
    exitOnCtrlC: false,
    kittyKeyboard: { mode: 'auto' }, // lets terminals that support it report Shift+Enter
  });
  await app.waitUntilExit();
  const gray = (s: string) => (process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[90m${s}\x1b[0m` : s);
  process.stdout.write(gray(`\n  Bye for now. Pick up past sessions with /resume.\n\n`));
}

/** One question, answer printed to stdout, then exit. Works in pipes. */
export function askOnce({ question, folder, model }: { question: string; folder: string; model?: string }): Promise<void> {
  // Check for updates
  checkForUpdates().catch(() => {});

  const modelId = model ?? loadPrefs().defaultModelId;
  return new Promise((resolve) => {
    let cancel = () => {};
    const onSigint = () => {
      cancel();
      process.stdout.write('\n');
      resolve();
    };
    process.once('SIGINT', onSigint);
    cancel = api.chat([{ id: 'q', role: 'user', content: question, createdAt: Date.now() }], modelById(modelId).id, folder, {
      onToken: (t) => process.stdout.write(t),
      onDone: () => {
        process.off('SIGINT', onSigint);
        process.stdout.write('\n');
        resolve();
      },
    });
  });
}
