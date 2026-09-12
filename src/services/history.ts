// Command history service

const MAX_HISTORY = 100;
let history: string[] = [];
let position = -1;

export const addToHistory = (command: string) => {
  const trimmed = command.trim();
  if (!trimmed) return;

  // Don't add duplicates in a row
  if (history[0] === trimmed) return;

  history.unshift(trimmed);
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  position = -1;
};

export const getPreviousCommand = (): string | undefined => {
  if (history.length === 0) return undefined;
  if (position < history.length - 1) {
    position++;
  }
  return history[position];
};

export const getNextCommand = (): string | undefined => {
  if (position > 0) {
    position--;
    return history[position];
  }
  position = -1;
  return '';
};

export const resetPosition = () => {
  position = -1;
};

export const getHistory = () => [...history];
export const clearHistory = () => {
  history = [];
  position = -1;
};
