// Logging service

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: unknown;
}

const logs: LogEntry[] = [];
let logLevel: LogLevel = 'info';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export const setLogLevel = (level: LogLevel) => {
  logLevel = level;
};

const log = (level: LogLevel, message: string, data?: unknown) => {
  if (LEVELS[level] < LEVELS[logLevel]) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: Date.now(),
    data,
  };

  logs.push(entry);

  const prefix = `[${level.toUpperCase()}]`;
  console[level === 'debug' ? 'log' : level](prefix, message, data || '');
};

export const debug = (msg: string, data?: unknown) => log('debug', msg, data);
export const info = (msg: string, data?: unknown) => log('info', msg, data);
export const warn = (msg: string, data?: unknown) => log('warn', msg, data);
export const error = (msg: string, data?: unknown) => log('error', msg, data);

export const getLogs = () => [...logs];
export const clearLogs = () => logs.length = 0;
