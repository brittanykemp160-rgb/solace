#!/usr/bin/env node
// `solace` terminal command.
//
//   solace [folder]           chat with Solace in the terminal
//   solace ask "question"     one answer, printed to stdout
//   solace desktop [folder]   open the desktop app (optionally on a folder)
//   solace desktop --dev      run the desktop app from source with hot reload
//
// Install once from the repo with `npm link`, then use it from anywhere.

'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const pkg = require(path.join(ROOT, 'package.json'));
const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';

// ---- output ------------------------------------------------------------------
const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (color ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const dim = paint('2');
const bold = paint('1');
const accent = paint('38;2;95;191;166');
const red = paint('31');

const log = (...a) => console.log(...a);
const fail = (msg, hint) => {
  console.error(`${red('✖')} ${msg}`);
  if (hint) console.error(`  ${dim(hint)}`);
  process.exit(1);
};

const HELP = `
  ${accent('◓')} ${bold('Solace')} ${dim('v' + pkg.version)}  ${dim('Your free AI coding agent')}

  ${bold('Usage')}
    solace ${dim('[folder]')}             Chat with Solace in this terminal
    solace ask ${dim('"question"')}       Print one answer and exit (works in pipes)
    solace desktop ${dim('[folder]')}     Open the Solace desktop app
    solace desktop --dev        Run the desktop app from source with hot reload
    solace --version            Print the version
    solace --help               Show this help

  ${bold('Examples')}
    solace                      ${dim('# chat about the current folder')}
    solace ~/code/my-app        ${dim('# chat about another folder')}
    solace ask "what is a closure?"
    git diff | solace ask "review this"
    solace desktop .            ${dim('# open the app on the current folder')}

  ${dim('Inside the chat, type / for commands or /help for shortcuts.')}
`;

// ---- helpers -----------------------------------------------------------------
function newestMtime(dir) {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    newest = Math.max(newest, entry.isDirectory() ? newestMtime(p) : fs.statSync(p).mtimeMs);
  }
  return newest;
}

/** Rebuild if there's no build yet or the source changed since the last one. */
function ensureBuilt(output, script, label) {
  const built = path.join(ROOT, output);
  const stale =
    !fs.existsSync(built) ||
    newestMtime(path.join(ROOT, 'src')) > fs.statSync(built).mtimeMs;
  if (!stale) return;
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) fail("Solace's dependencies aren't installed.", `Run "npm install" in ${ROOT}`);
  console.error(dim(`  Building ${label}…`));
  const r = spawnSync(npm, ['run', script, '--silent'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'], shell: isWin });
  if (r.status !== 0) fail('Build failed.', `Run "npm run ${script}" in ${ROOT} to see the details.`);
}

function electronBinary() {
  let bin;
  try {
    bin = require(path.join(ROOT, 'node_modules', 'electron'));
  } catch {
    fail("Solace's dependencies aren't installed.", `Run "npm install" in ${ROOT}`);
  }
  if (!bin || !fs.existsSync(bin)) {
    fail("Electron hasn't finished installing.", `Run "node node_modules/electron/install.js" in ${ROOT}`);
  }
  return bin;
}

// ---- commands ----------------------------------------------------------------
function desktop(args) {
  const dev = args.includes('--dev');
  const folderArg = args.find((a) => !a.startsWith('-'));
  const extra = [];

  if (folderArg) {
    const folder = path.resolve(process.cwd(), folderArg);
    if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) fail(`Not a folder: ${folder}`);
    extra.push(`--solace-folder=${folder}`);
  }

  if (dev) {
    const child = spawn(npm, ['run', 'dev', '--silent', '--', ...extra], { cwd: ROOT, stdio: 'inherit', shell: isWin });
    child.on('close', (code) => process.exit(code ?? 0));
    return;
  }

  ensureBuilt(path.join('dist', 'index.html'), 'build', 'the desktop app');
  const child = spawn(electronBinary(), [ROOT, ...extra], { cwd: ROOT, detached: true, stdio: 'ignore' });
  child.on('error', (e) => fail(`Couldn't start Solace: ${e.message}`));
  child.unref();
  log(`${accent('◓')} Opening Solace${folderArg ? dim(` in ${path.basename(path.resolve(folderArg))}`) : ''}…`);
}

function folderFrom(arg) {
  const folder = path.resolve(process.cwd(), arg || '.');
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) fail(`Not a folder: ${folder}`);
  return folder;
}

async function loadCli() {
  ensureBuilt(path.join('dist-cli', 'solace.mjs'), 'build:cli', 'Solace');
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  return import(pathToFileURL(path.join(ROOT, 'dist-cli', 'solace.mjs')).href);
}

/** Text piped or redirected into the command (`git diff | solace ask …`), else ''. */
async function readStdin() {
  let st;
  try {
    st = fs.fstatSync(0);
  } catch {
    return '';
  }
  if (process.stdin.isTTY || !(st.isFIFO() || st.isFile())) return '';
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data.trim();
}

async function chat(args) {
  const folder = folderFrom(args.find((a) => !a.startsWith('-')));
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    // Not an interactive terminal (e.g. piped): answer once instead.
    const question = await readStdin();
    if (!question) fail('The chat needs an interactive terminal.', 'To use Solace in a script, try: solace ask "your question"');
    const cli = await loadCli();
    return cli.askOnce({ question, folder });
  }
  const cli = await loadCli();
  await cli.startChat({ version: pkg.version, folder });
}

async function ask(args) {
  const words = args.filter((a) => !a.startsWith('-'));
  const piped = await readStdin();
  const question = [words.join(' '), piped].filter(Boolean).join('\n\n');
  if (!question) fail('Ask a question, e.g. solace ask "how do I reverse a list in Python?"');
  const cli = await loadCli();
  await cli.askOnce({ question, folder: process.cwd() });
}

// ---- main --------------------------------------------------------------------
const [cmd, ...rest] = process.argv.slice(2);

// Quietly stop when the reader goes away (e.g. `solace ask … | head`).
process.stdout.on('error', (e) => {
  if (e.code === 'EPIPE') process.exit(0);
  throw e;
});

const run = (p) => p.catch((e) => fail(e && e.message ? e.message : String(e)));

switch (cmd) {
  case undefined:
  case 'chat':
    run(chat(rest));
    break;
  case 'ask':
    run(ask(rest));
    break;
  case '-h':
  case '--help':
  case 'help':
    log(HELP);
    break;
  case '-v':
  case '--version':
  case 'version':
    log(pkg.version);
    break;
  case 'desktop':
  case 'app':
    desktop(rest);
    break;
  default:
    // `solace some/folder` starts the chat there.
    if (!cmd.startsWith('-') && fs.existsSync(path.resolve(cmd)) && fs.statSync(path.resolve(cmd)).isDirectory()) {
      run(chat([cmd, ...rest]));
      break;
    }
    console.error(`${red('✖')} Unknown command: ${cmd}`);
    log(HELP);
    process.exit(1);
}
