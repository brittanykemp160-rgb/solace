import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Box, Static, Text, useApp, useStdout } from 'ink';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Account, Message, Session, ToolStep } from '../types';
import { MODELS, findModel, modelById } from '../data/models';
import { PLANS, planById } from '../data/plans';
import { links, siteConnected } from '../config';
import { titleFrom } from '../services/chat';
import { formatTokens, uid } from '../lib/format';
import * as api from './api';
import { CLI_GROUPS, findCli, makeCommands } from './commands';
import { ROOT, configDir, resolveFolder, tildify } from './paths';
import { configPath, listSessions, loadPrefs, savePrefs, saveSession } from './storage';
import { c } from './theme';
import { Input } from './ui/Input';
import { AssistantMessage, EntryView, type Entry } from './ui/Message';
import { Spinner } from './ui/Spinner';
import { StatusBar } from './ui/StatusBar';
import { Welcome } from './ui/Welcome';

const GUEST: Account = { signedIn: false, name: 'Guest', email: '', planId: 'free', tokensUsedToday: 0, resetsAt: 0 };
const CLEAR = '\x1b[2J\x1b[3J\x1b[H';

interface Streaming {
  runId: number;
  text: string;
  steps?: ToolStep[];
  startedAt: number;
}

function newSession(folder: string, modelId: string): Session {
  const now = Date.now();
  return { id: uid(), title: 'New session', folder, modelId, messages: [], createdAt: now, updatedAt: now };
}

/** Opens a link in the default browser. Resolves false if that wasn't possible. */
function openUrl(url: string): Promise<boolean> {
  const [cmd, args]: [string, string[]] =
    process.platform === 'win32'
      ? ['rundll32', ['url.dll,FileProtocolHandler', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];
  return new Promise((resolve) => {
    try {
      const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
      child.once('error', () => resolve(false)); // e.g. no xdg-open on a headless server
      child.once('spawn', () => {
        child.unref();
        resolve(true);
      });
    } catch {
      resolve(false);
    }
  });
}

function ago(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function toMarkdown(s: Session): string {
  const model = modelById(s.modelId);
  const lines = [`# ${s.title}`, '', `_${model.name} · ${new Date(s.createdAt).toLocaleString()}_`, ''];
  for (const m of s.messages) {
    lines.push(m.role === 'user' ? '## You' : '## Solace', '', m.content, '');
  }
  return lines.join('\n');
}

export function App({ version, initialFolder }: { version: string; initialFolder: string }) {
  const { exit } = useApp();
  const { stdout, write } = useStdout();
  const [width, setWidth] = useState(stdout.columns || 80);

  const prefs = useRef(loadPrefs());
  const [folder, setFolder] = useState(initialFolder);
  const [modelId, setModelId] = useState(prefs.current.defaultModelId);
  const [account, setAccount] = useState<Account>(GUEST);
  const [session, setSession] = useState<Session>(() => newSession(initialFolder, prefs.current.defaultModelId));
  const [entries, setEntries] = useState<Entry[]>([{ id: 'welcome', kind: 'welcome' }]);
  const [epoch, setEpoch] = useState(0); // bumping it reprints the transcript after a screen clear
  const [streaming, setStreaming] = useState<Streaming | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [hint, setHint] = useState('');
  const [prefill, setPrefill] = useState<{ text: string; nonce: number }>();

  const cancelRef = useRef<(() => void) | null>(null);
  const runRef = useRef(0);
  const lastInterrupt = useRef(0);
  const hintTimer = useRef<NodeJS.Timeout>(undefined);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const streamRef = useRef(streaming);
  streamRef.current = streaming;

  const model = modelById(modelId);
  const plan = planById(account.planId);

  useEffect(() => {
    api.account().then(setAccount);
    const onResize = () => setWidth(stdout.columns || 80);
    stdout.on('resize', onResize);
    return () => {
      stdout.off('resize', onResize);
    };
  }, [stdout]);

  // ---- output helpers ----------------------------------------------------------
  const push = useCallback((...e: Entry[]) => setEntries((prev) => [...prev, ...e]), []);
  const notice = useCallback((body: ReactNode) => push({ id: uid(), kind: 'notice', body }), [push]);
  const error = useCallback((text: string) => push({ id: uid(), kind: 'error', text }), [push]);

  const flash = useCallback((text: string, ms = 2500) => {
    setHint(text);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(''), ms);
  }, []);

  const clearScreen = useCallback(
    (keep: Entry[] = [{ id: 'welcome', kind: 'welcome' }]) => {
      write(CLEAR);
      setEntries(keep);
      setEpoch((n) => n + 1);
    },
    [write],
  );

  const updateSession = (fn: (s: Session) => Session) => {
    const next = fn(sessionRef.current);
    sessionRef.current = next;
    setSession(next);
    saveSession(next);
  };

  // ---- replies -------------------------------------------------------------------
  function finish(stopped: boolean) {
    const s = streamRef.current;
    if (!s) return;
    runRef.current++; // ignore anything the old stream still sends
    cancelRef.current?.();
    cancelRef.current = null;
    setStreaming(null);
    push({ id: uid(), kind: 'assistant', text: s.text, steps: s.steps, stopped });
    if (s.text || s.steps) {
      updateSession((cur) => ({
        ...cur,
        updatedAt: Date.now(),
        messages: [...cur.messages, { id: uid(), role: 'assistant', content: s.text, steps: s.steps, createdAt: Date.now() }],
      }));
    }
  }

  function startReply(history: Message[]) {
    const runId = ++runRef.current;
    const st: Streaming = { runId, text: '', startedAt: Date.now() };
    streamRef.current = st;
    setStreaming(st);
    const live = () => runRef.current === runId;
    cancelRef.current = api.chat(history, modelId, folder, {
      onSteps: (steps) => {
        if (!live()) return;
        streamRef.current = { ...streamRef.current!, steps };
        setStreaming(streamRef.current);
      },
      onToken: (t) => {
        if (!live()) return;
        streamRef.current = { ...streamRef.current!, text: streamRef.current!.text + t };
        setStreaming(streamRef.current);
      },
      onDone: () => {
        if (live()) finish(false);
      },
    });
  }

  function send(text: string) {
    if (streamRef.current) return flash('Solace is still replying. Press Esc to stop it first.');
    setPrompts((p) => (p[p.length - 1] === text ? p : [...p, text]));
    push({ id: uid(), kind: 'user', text });
    const msg: Message = { id: uid(), role: 'user', content: text, createdAt: Date.now() };
    const first = sessionRef.current.messages.length === 0;
    updateSession((s) => ({
      ...s,
      folder,
      modelId,
      title: first ? titleFrom(text) : s.title,
      updatedAt: Date.now(),
      messages: [...s.messages, msg],
    }));
    startReply(sessionRef.current.messages);
  }

  // ---- slash commands --------------------------------------------------------------
  const sessionOptions = useCallback(
    () =>
      listSessions().map((s) => ({
        value: s.id,
        label: s.title,
        hint: `${ago(s.updatedAt)} · ${s.messages.length} messages · ${tildify(s.folder ?? '')}`,
      })),
    [],
  );
  const commands = useMemo(() => makeCommands(sessionOptions), [sessionOptions]);
  const ask = (text: string) => setPrefill({ text, nonce: Date.now() });

  const [quitting, setQuitting] = useState(false);
  function quit() {
    if (streamRef.current) finish(true);
    // Let the last frame drop the input box before Ink stops drawing.
    setQuitting(true);
    setTimeout(() => exit(), 30);
  }

  function runCommand(name: string, arg: string) {
    const cmd = findCli(commands, name);
    if (!cmd) return error(`Unknown command /${name}. Type /help to see them all.`);
    if (cmd.soon) return notice(<Text>/{cmd.name} is coming soon.</Text>);
    const busy = !!streamRef.current;
    const needsIdle = ['new', 'clear', 'resume', 'retry', 'model', 'folder'];
    if (busy && needsIdle.includes(cmd.name)) return flash('Wait for the reply to finish, or press Esc to stop it.');

    switch (cmd.name) {
      case 'new': {
        setSession(newSession(folder, modelId));
        sessionRef.current = newSession(folder, modelId);
        push({ id: uid(), kind: 'divider', label: 'New session' });
        return;
      }
      case 'clear': {
        sessionRef.current = newSession(folder, modelId);
        setSession(sessionRef.current);
        clearScreen();
        return;
      }
      case 'resume': {
        if (!arg) {
          if (!listSessions(1).length) return notice(<Text color={c.muted}>No saved sessions yet.</Text>);
          return ask('/resume ');
        }
        const all = listSessions(200);
        const q = arg.toLowerCase();
        const s = all.find((x) => x.id === arg) ?? all.find((x) => x.title.toLowerCase().includes(q));
        if (!s) return error(`No session matches "${arg}".`);
        sessionRef.current = s;
        setSession(s);
        setModelId(s.modelId);
        if (s.folder && fs.existsSync(s.folder)) setFolder(s.folder);
        clearScreen([
          { id: 'welcome', kind: 'welcome' },
          { id: uid(), kind: 'divider', label: `Resumed: ${s.title}` },
          ...s.messages.map<Entry>((m) =>
            m.role === 'user' ? { id: m.id, kind: 'user', text: m.content } : { id: m.id, kind: 'assistant', text: m.content, steps: m.steps },
          ),
        ]);
        return;
      }
      case 'retry': {
        const msgs = sessionRef.current.messages;
        const lastUser = msgs.map((m) => m.role).lastIndexOf('user');
        if (lastUser < 0) return notice(<Text color={c.muted}>Nothing to retry yet.</Text>);
        const history = msgs.slice(0, lastUser + 1);
        updateSession((s) => ({ ...s, messages: history }));
        push({ id: uid(), kind: 'user', text: msgs[lastUser].content });
        startReply(history);
        return;
      }
      case 'export': {
        const s = sessionRef.current;
        if (!s.messages.length) return notice(<Text color={c.muted}>Nothing to export yet. Send a message first.</Text>);
        const slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'session';
        const file = resolveFolder(arg || `solace-${slug}.md`, folder);
        try {
          fs.writeFileSync(file, toMarkdown(s));
          return notice(<Text>Saved to <Text color={c.accent}>{tildify(file)}</Text></Text>);
        } catch (e) {
          return error(`Couldn't save: ${(e as Error).message}`);
        }
      }
      case 'model': {
        if (!arg) return ask('/model ');
        const m = findModel(arg);
        if (!m) return error(`No model matches "${arg}". Try: ${MODELS.map((x) => x.short.split(' ')[0].toLowerCase()).join(', ')}`);
        setModelId(m.id);
        prefs.current = { ...prefs.current, defaultModelId: m.id };
        savePrefs(prefs.current);
        return notice(<Text>Model set to <Text bold>{m.name}</Text></Text>);
      }
      case 'models':
        return notice(
          <Box flexDirection="column">
            {MODELS.map((m) => (
              <Box key={m.id} flexDirection="column" marginBottom={1}>
                <Text>
                  <Text color={m.logo === 'kimi' ? c.kimi : c.deepseek}>● </Text>
                  <Text bold>{m.name.padEnd(Math.max(...MODELS.map((x) => x.name.length)) + 2)}</Text>
                  <Text color={c.muted}>{m.provider} · {m.tag}</Text>
                  {m.id === modelId ? <Text color={c.accent}>  ✓ current</Text> : null}
                </Text>
                <Text color={c.muted}>  {m.description}</Text>
              </Box>
            ))}
            <Text color={c.muted}>Switch with /model, e.g. /model kimi</Text>
          </Box>,
        );
      case 'folder': {
        if (!arg) return notice(<Text>Working in <Text color={c.accent}>{tildify(folder)}</Text><Text color={c.muted}>  (change it with /folder &lt;path&gt;)</Text></Text>);
        const next = resolveFolder(arg, folder);
        if (!fs.existsSync(next) || !fs.statSync(next).isDirectory()) return error(`Not a folder: ${tildify(next)}`);
        setFolder(next);
        return notice(<Text>Now working in <Text color={c.accent}>{tildify(next)}</Text></Text>);
      }
      case 'usage': {
        const used = account.tokensUsedToday;
        const limit = plan.dailyTokens;
        const barW = 30;
        const filled = limit ? Math.round((used / limit) * barW) : 0;
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        return notice(
          <Box flexDirection="column">
            <Text>
              <Text bold>{formatTokens(used)}</Text>
              <Text color={c.muted}> of {limit === null ? 'unlimited' : formatTokens(limit)} tokens used today · {plan.name} plan</Text>
            </Text>
            {limit !== null ? (
              <Text>
                <Text color={c.accent}>{'█'.repeat(filled)}</Text>
                <Text color={c.border}>{'░'.repeat(barW - filled)}</Text>
              </Text>
            ) : null}
            <Text color={c.muted}>Resets at midnight ({midnight.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}). See /plans for more.</Text>
          </Box>,
        );
      }
      case 'plans': {
        const connected = siteConnected();
        return notice(
          <Box flexDirection="column">
            {PLANS.map((p) => (
              <Box key={p.id} flexDirection="column" marginBottom={1}>
                <Text>
                  <Text bold color={p.highlight ? c.accent : undefined}>{p.name.padEnd(11)}</Text>
                  <Text>{p.priceMonthly === 0 ? '$0' : `$${p.priceMonthly}/mo`}</Text>
                  <Text color={c.muted}>
                    {'  ·  '}
                    {p.dailyTokens === null ? 'Unlimited tokens' : `${formatTokens(p.dailyTokens)} tokens a day`}
                  </Text>
                  {p.id === account.planId ? <Text color={c.accent}>  ✓ your plan</Text> : null}
                </Text>
                <Text color={c.muted}>{'           '}{p.tagline}</Text>
              </Box>
            ))}
            <Text color={c.muted}>
              {!connected
                ? 'Upgrades open on the Solace website once it is live.'
                : account.signedIn
                  ? `Upgrade at ${links.checkout('plus', 'cli')}`
                  : 'Sign in with /login to upgrade. Checkout happens on the Solace website.'}
            </Text>
          </Box>,
        );
      }
      case 'login': {
        if (account.signedIn) return notice(<Text>Signed in as {account.email || account.name}.</Text>);
        const url = links.signIn('cli');
        return void openUrl(url).then((opened) =>
          notice(
            <Box flexDirection="column">
              <Text>{opened ? 'Opened the Solace website in your browser to sign in.' : "Couldn't open a browser here. To sign in, visit:"}</Text>
              <Text color={c.accent}>{url}</Text>
              <Text color={c.muted}>Plans and payments are handled there too. You can keep using Solace as a guest meanwhile.</Text>
            </Box>,
          ),
        );
      }
      case 'logout':
        if (!account.signedIn) return notice(<Text color={c.muted}>You're not signed in.</Text>);
        // TODO: also forget the stored session token
        return void api.account().then((a) => {
          setAccount({ ...a, signedIn: false });
          notice(<Text>Signed out.</Text>);
        });
      case 'desktop': {
        try {
          spawn(process.execPath, [path.join(ROOT, 'bin', 'solace.cjs'), 'desktop', folder], { detached: true, stdio: 'ignore' }).unref();
          return notice(<Text>Opening <Text color={c.accent}>{tildify(folder)}</Text> in Solace desktop…</Text>);
        } catch (e) {
          return error(`Couldn't open the desktop app: ${(e as Error).message}`);
        }
      }
      case 'config':
        return notice(
          <Box flexDirection="column">
            <Text><Text color={c.muted}>{'model'.padEnd(10)}</Text>{model.name}</Text>
            <Text><Text color={c.muted}>{'folder'.padEnd(10)}</Text>{tildify(folder)}</Text>
            <Text><Text color={c.muted}>{'account'.padEnd(10)}</Text>{account.signedIn ? account.email : 'Guest (not signed in)'}</Text>
            <Text><Text color={c.muted}>{'settings'.padEnd(10)}</Text>{tildify(configPath())}</Text>
            <Text><Text color={c.muted}>{'history'.padEnd(10)}</Text>{tildify(path.join(configDir(), 'sessions'))}</Text>
          </Box>,
        );
      case 'help':
        return notice(<Help commands={commands} />);
      case 'exit':
        return quit();
    }
  }

  // ---- keys -------------------------------------------------------------------------
  function onEscape() {
    if (streamRef.current) finish(true);
  }

  function onInterrupt() {
    if (streamRef.current) return finish(true);
    const now = Date.now();
    if (now - lastInterrupt.current < 2000) return quit();
    lastInterrupt.current = now;
    flash('Press Ctrl+C again to exit', 2000);
  }

  const welcome = <Welcome version={version} folder={folder} model={model} plan={plan} used={account.tokensUsedToday} width={width} />;

  return (
    <>
      <Static key={epoch} items={entries}>
        {(e) => <EntryView key={e.id} e={e} welcome={welcome} />}
      </Static>
      {quitting ? null : (
      <Box flexDirection="column" width={width}>
        {streaming ? (
          <>
            <AssistantMessage text={streaming.text} steps={streaming.steps} />
            <Box paddingX={1} marginTop={1}>
              <Spinner startedAt={streaming.startedAt} label={streaming.text ? 'Writing' : streaming.steps ? 'Reading' : undefined} />
            </Box>
          </>
        ) : null}
        <Box marginTop={1} flexDirection="column">
          <Input
            commands={commands}
            history={prompts}
            width={width}
            prefill={prefill}
            onSubmit={send}
            onCommand={runCommand}
            onEscape={onEscape}
            onInterrupt={onInterrupt}
            onClearScreen={() => clearScreen(entries)}
          />
          <StatusBar folder={folder} model={model} account={account} hint={hint} />
        </Box>
      </Box>
      )}
    </>
  );
}

function Help({ commands }: { commands: ReturnType<typeof makeCommands> }) {
  const col = 22;
  const keys: [string, string][] = [
    ['Enter', 'Send'],
    ['\\ then Enter, Alt+Enter', 'New line'],
    ['↑ ↓', 'Previous messages'],
    ['Tab', 'Complete a command'],
    ['Esc', 'Stop the reply / close the menu'],
    ['Ctrl+C', 'Clear the box, stop, or exit (twice)'],
    ['Ctrl+L', 'Redraw the screen'],
  ];
  return (
    <Box flexDirection="column">
      {CLI_GROUPS.map((g) => (
        <Box key={g} flexDirection="column" marginBottom={1}>
          <Text bold>{g}</Text>
          {commands
            .filter((cmd) => cmd.group === g)
            .map((cmd) => {
              const name = `/${cmd.name}${cmd.args ? ' ' + cmd.args : ''}`;
              return (
                <Text key={cmd.name}>
                  <Text color={c.accent}>{name.padEnd(col)}</Text>
                  <Text color={c.muted}>
                    {cmd.description}
                    {cmd.aliases?.length ? `  (${cmd.aliases.map((a) => '/' + a).join(', ')})` : ''}
                  </Text>
                </Text>
              );
            })}
        </Box>
      ))}
      <Text bold>Shortcuts</Text>
      {keys.map(([k, d]) => (
        <Text key={k}>
          <Text>{k.padEnd(col + 4)}</Text>
          <Text color={c.muted}>{d}</Text>
        </Text>
      ))}
    </Box>
  );
}
