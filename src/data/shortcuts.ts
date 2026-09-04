// Keyboard shortcuts

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

export const SHORTCUTS: Shortcut[] = [
  { key: 'Enter', action: 'send', description: 'Send message' },
  { key: 'c', ctrl: true, action: 'cancel', description: 'Cancel / Exit' },
  { key: 'l', ctrl: true, action: 'clear', description: 'Clear screen' },
  { key: 'ArrowUp', action: 'prev', description: 'Previous message' },
  { key: 'ArrowDown', action: 'next', description: 'Next message' },
  { key: 'Tab', action: 'complete', description: 'Complete command' },
  { key: 'a', ctrl: true, action: 'lineStart', description: 'Start of line' },
  { key: 'e', ctrl: true, action: 'lineEnd', description: 'End of line' },
  { key: 'u', ctrl: true, action: 'clearLine', description: 'Clear line' },
  { key: 'w', ctrl: true, action: 'deleteWord', description: 'Delete word' },
];

export const matchShortcut = (key: string, ctrl = false, shift = false, alt = false): Shortcut | undefined => {
  return SHORTCUTS.find(s =>
    s.key === key &&
    (s.ctrl || false) === ctrl &&
    (s.shift || false) === shift &&
    (s.alt || false) === alt
  );
};
