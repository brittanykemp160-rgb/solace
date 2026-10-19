// Dev runner: starts the Vite dev server, then launches Electron pointed at it.
// Closing the Electron window stops the dev server.

import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import electronPath from 'electron';

const server = await createServer({ configFile: 'vite.config.mts' });
await server.listen();

const address = server.resolvedUrls?.local?.[0] ?? 'http://localhost:5173/';
console.log(`\n  Solace dev server: ${address}\n  Launching Electron…\n`);

const child = spawn(electronPath, ['.', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_SERVER_URL: address },
});

child.on('close', async (code) => {
  await server.close();
  process.exit(code ?? 0);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig));
}
