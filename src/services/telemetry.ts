// Usage telemetry - can be disabled with SOLACE_NO_TELEMETRY=1

import { apiRequest } from './api';

interface Event {
  name: string;
  props?: Record<string, unknown>;
  ts?: number;
}

let enabled = process.env.SOLACE_NO_TELEMETRY !== '1';
const queue: Event[] = [];

export function setEnabled(value: boolean): void {
  enabled = value;
}

export function track(name: string, props?: Record<string, unknown>): void {
  if (!enabled) return;
  queue.push({ name, props, ts: Date.now() });
}

export async function flush(): Promise<void> {
  if (!queue.length || !enabled) return;
  const events = queue.splice(0);
  try {
    await apiRequest('/telemetry', { method: 'POST', body: { events } });
  } catch {
    queue.unshift(...events);
  }
}

export const trackSession = () => track('session');
export const trackMessage = () => track('message');
export const trackCommand = (cmd: string) => track('command', { cmd });
