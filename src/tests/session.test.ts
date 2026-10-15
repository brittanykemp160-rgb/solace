// Session tests

import { createSession, addMessage, updateLastMessage, generateTitle } from '../services/session';

describe('createSession', () => {
  it('creates session with defaults', () => {
    const session = createSession();
    expect(session.id).toBeTruthy();
    expect(session.title).toBe('New Session');
    expect(session.messages).toHaveLength(0);
  });

  it('accepts folder parameter', () => {
    const session = createSession('/test/folder');
    expect(session.folder).toBe('/test/folder');
  });
});

describe('addMessage', () => {
  it('adds message to session', () => {
    const session = createSession();
    const updated = addMessage(session, { role: 'user', content: 'Hello' });
    expect(updated.messages).toHaveLength(1);
    expect(updated.messages[0].content).toBe('Hello');
  });
});

describe('updateLastMessage', () => {
  it('updates last message content', () => {
    let session = createSession();
    session = addMessage(session, { role: 'assistant', content: 'Hi' });
    session = updateLastMessage(session, 'Hi there');
    expect(session.messages[0].content).toBe('Hi there');
  });
});

describe('generateTitle', () => {
  it('generates title from first user message', () => {
    let session = createSession();
    session = addMessage(session, { role: 'user', content: 'How do I parse JSON?' });
    expect(generateTitle(session)).toBe('How do I parse JSON?');
  });

  it('truncates long titles', () => {
    let session = createSession();
    session = addMessage(session, { role: 'user', content: 'A'.repeat(100) });
    expect(generateTitle(session).length).toBeLessThan(60);
  });
});
