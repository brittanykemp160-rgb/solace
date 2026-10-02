import type { Account, Message, ToolStep } from '../types';
import { streamReply } from '../services/chat';
import { getAccount } from '../services/account';

// Backend calls for the terminal app. PLACEHOLDER: replies are the same canned
// stream the desktop app uses, and everyone is a signed-out guest.
// TODO: when the Solace backend exists, stream from it here (SSE), using
// SOLACE_API_URL (or a default in src/config.ts) and the stored session token.
// Provider keys stay on the server; never in this app.

export const API_URL = process.env.SOLACE_API_URL ?? '';

export interface ChatHandlers {
  onSteps?: (steps: ToolStep[]) => void;
  onToken: (text: string) => void;
  onDone: () => void;
}

/** Starts a streamed reply. Returns a function that cancels it. */
export function chat(history: Message[], modelId: string, folder: string, h: ChatHandlers): () => void {
  return streamReply({ history, modelId, folder }, h);
}

export function account(): Promise<Account> {
  return getAccount();
}
