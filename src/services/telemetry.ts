/**
 * Anonymous Usage Telemetry
 * 
 * Collects anonymous, aggregated usage data to help improve Solace.
 * 
 * What we collect:
 * - Feature usage counts (which commands are popular)
 * - Error rates (to catch and fix bugs)
 * - Performance metrics (to optimize slow operations)
 * 
 * What we DON'T collect:
 * - Personal information
 * - Code or file contents
 * - Chat messages or prompts
 * - File paths or project names
 * 
 * Telemetry can be disabled by setting SOLACE_NO_TELEMETRY=1
 * or by running `solace config set telemetry false`
 * 
 * @see https://docs.solace.dev/privacy for our privacy policy
 */

import { apiRequest } from './api';

/**
 * Represents a single telemetry event.
 */
interface TelemetryEvent {
  /** Event name (e.g., 'command_used', 'error_occurred') */
  event: string;
  /** Additional event properties (anonymized) */
  properties?: Record<string, unknown>;
  /** Unix timestamp when event occurred */
  timestamp?: number;
}

/** Whether telemetry is enabled (respects user preference) */
let enabled = true;

/** Queue of events waiting to be sent */
const queue: TelemetryEvent[] = [];

/**
 * Enable or disable telemetry collection.
 * Users can opt out at any time.
 */
export function setTelemetryEnabled(value: boolean): void {
  enabled = value;
  
  // Clear queue if disabled (don't send pending events)
  if (!value) {
    queue.length = 0;
  }
}

/**
 * Check if telemetry is currently enabled.
 */
export function isTelemetryEnabled(): boolean {
  // Check environment variable override
  if (process.env.SOLACE_NO_TELEMETRY === '1') {
    return false;
  }
  return enabled;
}

/**
 * Track an anonymous event.
 * Events are queued and sent in batches to minimize network requests.
 * 
 * @param event - Event name
 * @param properties - Optional anonymized properties
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!isTelemetryEnabled()) {
    return;
  }

  queue.push({
    event,
    properties,
    timestamp: Date.now(),
  });
}

/**
 * Flush queued events to the server.
 * Called periodically and on app shutdown.
 */
export async function flush(): Promise<void> {
  if (queue.length === 0 || !isTelemetryEnabled()) {
    return;
  }

  // Take all events from the queue
  const events = queue.splice(0, queue.length);

  try {
    await apiRequest('/telemetry', {
      method: 'POST',
      body: { events },
    });
  } catch {
    // Failed to send - re-queue events for next attempt
    // Events will be lost if app closes, which is acceptable
    queue.unshift(...events);
  }
}

// Convenience functions for common events

/** Track when a session starts */
export function trackSessionStart(): void {
  track('session_start');
}

/** Track when a session ends */
export function trackSessionEnd(): void {
  track('session_end');
}

/** Track when a message is sent */
export function trackMessage(): void {
  track('message_sent');
}

/** Track when a slash command is used */
export function trackCommand(command: string): void {
  track('command_used', { command });
}
