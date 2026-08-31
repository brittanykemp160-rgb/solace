// Process utilities

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const run = async (command: string): Promise<{ stdout: string; stderr: string }> => {
  return execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
};

export const runInBackground = (command: string, args: string[] = []): void => {
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
};

export const isRunning = async (name: string): Promise<boolean> => {
  try {
    const { stdout } = await run(
      process.platform === 'win32'
        ? `tasklist /FI "IMAGENAME eq ${name}"`
        : `pgrep -x ${name}`
    );
    return stdout.includes(name);
  } catch {
    return false;
  }
};
