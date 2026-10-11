// Streaming response hook

import { useState, useCallback, useRef } from 'react';
import { streamResponse, StreamEvent } from '../services/stream';

interface UseStreamOptions {
  onText?: (text: string) => void;
  onTool?: (tool: { name: string; status: string }) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export const useStream = (options: UseStreamOptions = {}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (response: Response) => {
    setIsStreaming(true);
    setContent('');
    abortRef.current = new AbortController();

    await streamResponse(response, (event: StreamEvent) => {
      switch (event.type) {
        case 'text':
          if (event.content) {
            setContent(prev => prev + event.content);
            options.onText?.(event.content);
          }
          break;
        case 'tool':
          if (event.tool) {
            options.onTool?.(event.tool);
          }
          break;
        case 'error':
          if (event.error) {
            options.onError?.(event.error);
          }
          break;
        case 'done':
          setIsStreaming(false);
          options.onDone?.();
          break;
      }
    });
  }, [options]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    content,
    start,
    stop,
  };
};
