// Session management

import type { Session, Message } from '../types';
import { uid } from '../lib/format';
import { DEFAULT_MODEL_ID } from '../data/models';

export function createSession(folder: string | null = null): Session {
  return {
    id: uid(),
    title: 'New Session',
    folder,
    modelId: DEFAULT_MODEL_ID,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addMessage(session: Session, message: Omit<Message, 'id' | 'createdAt'>): Session {
  return {
    ...session,
    messages: [
      ...session.messages,
      {
        ...message,
        id: uid(),
        createdAt: Date.now(),
      },
    ],
    updatedAt: Date.now(),
  };
}

export function updateLastMessage(session: Session, content: string): Session {
  if (session.messages.length === 0) return session;

  const messages = [...session.messages];
  messages[messages.length - 1] = {
    ...messages[messages.length - 1],
    content,
  };

  return { ...session, messages, updatedAt: Date.now() };
}

export function generateTitle(session: Session): string {
  const firstUserMessage = session.messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Session';

  const content = firstUserMessage.content.trim();
  if (content.length <= 50) return content;
  return content.slice(0, 47) + '...';
}
