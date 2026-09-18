// Anonymous usage telemetry

import { apiRequest } from './api';

interface TelemetryEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

let enabled = true;
const queue: TelemetryEvent[] = [];

export const setTelemetryEnabled = (value: boolean) => {
  enabled = value;
};

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (!enabled) return;

  queue.push({
    event,
    properties,
    timestamp: Date.now(),
  });
};

export const flush = async () => {
  if (queue.length === 0) return;

  const events = queue.splice(0, queue.length);

  try {
    await apiRequest('/telemetry', {
      method: 'POST',
      body: { events },
    });
  } catch {
    // Re-queue on failure
    queue.unshift(...events);
  }
};

// Track common events
export const trackSessionStart = () => track('session_start');
export const trackSessionEnd = () => track('session_end');
export const trackMessage = () => track('message_sent');
export const trackCommand = (command: string) => track('command_used', { command });
