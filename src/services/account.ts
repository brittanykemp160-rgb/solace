import type { Account } from '../types';

// PLACEHOLDER account service. Everyone starts as a signed-out guest with 0 tokens used.
// TODO: after the website sign-in, receive a session token (e.g. via a solace://
// deep link), then fetch the real plan and usage from the backend.

function nextMidnight(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

const GUEST: Account = {
  signedIn: false,
  name: 'Guest',
  email: '',
  planId: 'free',
  tokensUsedToday: 0,
  resetsAt: nextMidnight(),
};

let account: Account = { ...GUEST, resetsAt: nextMidnight() };

export async function getAccount(): Promise<Account> {
  return { ...account };
}

/** TODO: clear the stored session token too. */
export async function signOut(): Promise<Account> {
  account = { ...GUEST, resetsAt: nextMidnight() };
  return { ...account };
}
