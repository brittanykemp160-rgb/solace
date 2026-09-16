// Streaming response handler

import { STREAM_TIMEOUT } from '../lib/constants';

export interface StreamEvent {
  type: 'text' | 'tool' | 'error' | 'done';
  content?: string;
  tool?: { name: string; status: string };
  error?: string;
}

export type StreamCallback = (event: StreamEvent) => void;

export async function streamResponse(
  response: Response,
  onEvent: StreamCallback
): Promise<void> {
  if (!response.body) {
    onEvent({ type: 'error', error: 'No response body' });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const timeout = setTimeout(() => {
    reader.cancel();
    onEvent({ type: 'error', error: 'Stream timeout' });
  }, STREAM_TIMEOUT);

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onEvent({ type: 'done' });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onEvent({ type: 'done' });
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onEvent({ type: 'text', content: parsed.text });
            } else if (parsed.tool) {
              onEvent({ type: 'tool', tool: parsed.tool });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    clearTimeout(timeout);
  }
}
