// Session state hook

import { useState, useCallback } from 'react';
import type { Session, Message } from '../types';
import { createSession, addMessage, updateLastMessage, generateTitle } from '../services/session';

export const useSession = (folder: string | null = null) => {
  const [session, setSession] = useState<Session>(() => createSession(folder));

  const sendMessage = useCallback((content: string) => {
    setSession(prev => {
      let next = addMessage(prev, { role: 'user', content });
      next = addMessage(next, { role: 'assistant', content: '', streaming: true });
      return next;
    });
  }, []);

  const updateStreaming = useCallback((content: string) => {
    setSession(prev => updateLastMessage(prev, content));
  }, []);

  const finishStreaming = useCallback(() => {
    setSession(prev => {
      const messages = [...prev.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          streaming: false,
        };
      }
      const title = prev.title === 'New Session' ? generateTitle({ ...prev, messages }) : prev.title;
      return { ...prev, messages, title };
    });
  }, []);

  const reset = useCallback(() => {
    setSession(createSession(folder));
  }, [folder]);

  return {
    session,
    sendMessage,
    updateStreaming,
    finishStreaming,
    reset,
  };
};
