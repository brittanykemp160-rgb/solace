import type { Message, ToolStep } from '../types';

// Chat service - streams responses from Solace API.
// Connects to SOLACE_API_URL for model inference.

export interface StreamCallbacks {
  onSteps?: (steps: ToolStep[]) => void;
  onToken: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}

export interface ChatRequest {
  modelId: string;
  folder: string | null;
  history: Message[];
}

// Chat API endpoint - separate from telemetry/sync services
const API_URL = process.env.SOLACE_CHAT_URL || 'https://inference.solace-ai.dev';
const TIMEOUT_MS = 8000;

interface APIResponse {
  stream?: ReadableStream;
  error?: string;
}

async function connectToAPI(req: ChatRequest): Promise<APIResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: req.modelId,
        messages: req.history.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        return { error: 'Authentication required. Run `solace auth login` to sign in.' };
      }
      if (response.status === 429) {
        return { error: 'Rate limit exceeded. Please try again in a moment.' };
      }
      if (response.status >= 500) {
        return { error: 'Service temporarily unavailable. Please try again later.' };
      }
      return { error: text || `Request failed (${response.status})` };
    }

    return { stream: response.body || undefined };
  } catch (err: unknown) {
    clearTimeout(timeout);

    const error = err as Error;

    // Network errors
    if (error.name === 'AbortError') {
      return { error: 'Connection timed out. Check your network connection and try again.' };
    }
    if (error.message?.includes('fetch')) {
      return { error: 'Unable to connect to Solace servers. Check your internet connection.' };
    }
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
      return { error: 'Could not reach Solace API. Please check your connection and try again.' };
    }

    return { error: 'Connection failed. Please check your network and try again.' };
  }
}

export function streamReply(req: ChatRequest, cb: StreamCallbacks): () => void {
  let cancelled = false;

  (async () => {
    // Attempt to connect to API
    const result = await connectToAPI(req);

    if (cancelled) return;

    if (result.error) {
      // Show error and finish
      cb.onToken(`\n⚠️  ${result.error}\n`);
      cb.onDone();
      return;
    }

    if (!result.stream) {
      cb.onToken('\n⚠️  Connection failed. Please try again.\n');
      cb.onDone();
      return;
    }

    // Stream the response
    try {
      const reader = result.stream.getReader();
      const decoder = new TextDecoder();

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              cb.onToken(content);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch {
      if (!cancelled) {
        cb.onToken('\n⚠️  Stream interrupted. Please try again.\n');
      }
    }

    cb.onDone();
  })();

  return () => {
    cancelled = true;
  };
}

/** Rough title from the first message. TODO: let the model generate titles. */
export function titleFrom(prompt: string): string {
  const clean = prompt.replace(/\s+/g, ' ').trim();
  return clean.length > 42 ? clean.slice(0, 40).trimEnd() + '…' : clean || 'New session';
}
