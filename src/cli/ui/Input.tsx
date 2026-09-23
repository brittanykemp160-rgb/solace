import { Box, Text, useInput } from 'ink';
import { useEffect, useMemo, useState } from 'react';
import { parseSlash } from '../../commands';
import type { CommandOption } from '../../commands';
import { findCli, matchCli, matchOptions, optionsOf, type CliCommand } from '../commands';
import { c } from '../theme';

// The message box: multi-line editing, ↑↓ history, and the slash command menu
// (↑↓ to move, Tab to complete, Enter to run, Esc to dismiss).

type Item = { kind: 'cmd'; cmd: CliCommand } | { kind: 'opt'; cmd: CliCommand; opt: CommandOption };

export interface InputProps {
  commands: CliCommand[];
  history: string[];
  width: number;
  /** Replaces the box's text when `nonce` changes (e.g. `/model` → "/model "). */
  prefill?: { text: string; nonce: number };
  onSubmit: (text: string) => void;
  onCommand: (name: string, arg: string) => void;
  /** Esc with nothing to dismiss. */
  onEscape: () => void;
  /** Ctrl+C with an empty box. */
  onInterrupt: () => void;
  onClearScreen: () => void;
}

const MAX_ROWS = 8;

export function Input({ commands, history, width, prefill, onSubmit, onCommand, onEscape, onInterrupt, onClearScreen }: InputProps) {
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState(0);
  const [sel, setSel] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [histIdx, setHistIdx] = useState(-1); // -1 = editing a new message
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (prefill) set(prefill.text);
  }, [prefill?.nonce]);

  function set(text: string, pos = text.length) {
    setValue(text);
    setCursor(Math.max(0, Math.min(pos, text.length)));
    setSel(0);
    setDismissed(false);
  }

  // ---- slash menu ------------------------------------------------------------
  const items = useMemo<Item[]>(() => {
    const p = parseSlash(value);
    if (!p) return [];
    if (!p.hasSpace) return matchCli(commands, p.name).map((cmd) => ({ kind: 'cmd' as const, cmd }));
    const cmd = findCli(commands, p.name);
    if (!cmd) return [];
    return matchOptions(optionsOf(cmd), p.arg).map((opt) => ({ kind: 'opt' as const, cmd, opt }));
  }, [value, commands]);

  const menuOpen = items.length > 0 && !dismissed;
  const selected = menuOpen ? items[Math.min(sel, items.length - 1)] : undefined;

  function complete(item: Item) {
    if (item.kind === 'cmd') set(`/${item.cmd.name} `);
    else set(`/${item.cmd.name} ${item.opt.value}`);
  }

  function submit() {
    const text = value.trim();
    if (!text) return;
    set('');
    setHistIdx(-1);
    const p = parseSlash(text);
    if (p) onCommand(p.name, p.arg);
    else onSubmit(text);
  }

  // ---- editing helpers ---------------------------------------------------------
  const insert = (s: string) => set(value.slice(0, cursor) + s + value.slice(cursor), cursor + s.length);
  const lineStart = (pos: number) => value.lastIndexOf('\n', pos - 1) + 1;
  const lineEnd = (pos: number) => {
    const i = value.indexOf('\n', pos);
    return i < 0 ? value.length : i;
  };
  const wordLeft = (pos: number) => {
    let i = pos;
    while (i > 0 && /\s/.test(value[i - 1])) i--;
    while (i > 0 && !/\s/.test(value[i - 1])) i--;
    return i;
  };

  function moveVertical(dir: -1 | 1): boolean {
    const start = lineStart(cursor);
    const col = cursor - start;
    if (dir < 0) {
      if (start === 0) return false;
      const prevStart = lineStart(start - 1);
      setCursor(Math.min(prevStart + col, start - 1));
    } else {
      const end = lineEnd(cursor);
      if (end === value.length) return false;
      const nextStart = end + 1;
      setCursor(Math.min(nextStart + col, lineEnd(nextStart)));
    }
    return true;
  }

  function recall(dir: -1 | 1) {
    if (!history.length) return;
    let idx = histIdx;
    if (dir < 0) {
      if (idx === -1) {
        setDraft(value);
        idx = history.length - 1;
      } else idx = Math.max(0, idx - 1);
    } else {
      if (idx === -1) return;
      idx = idx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        set(draft);
        return;
      }
    }
    setHistIdx(idx);
    set(history[idx]);
  }

  useInput((input, key) => {
    // Ctrl+C: clear the box, or tell the app (stop / exit).
    if (key.ctrl && input === 'c') {
      if (value) set('');
      else onInterrupt();
      return;
    }
    if (key.ctrl && input === 'l') return onClearScreen();

    if (key.escape) {
      if (menuOpen) setDismissed(true);
      else onEscape();
      return;
    }

    if (key.return) {
      // New line: Shift+Enter (where the terminal reports it), Alt/Option+Enter, or "\" then Enter.
      if (key.shift || key.meta) return insert('\n');
      if (value[cursor - 1] === '\\') return set(value.slice(0, cursor - 1) + '\n' + value.slice(cursor), cursor);
      if (selected) {
        if (selected.kind === 'opt') {
          set('');
          return onCommand(selected.cmd.name, selected.opt.value);
        }
        // A command with choices opens them; others run straight away.
        const p = parseSlash(value);
        if (optionsOf(selected.cmd).length && !p?.hasSpace) return complete(selected);
        set('');
        return onCommand(selected.cmd.name, '');
      }
      return submit();
    }

    if (key.tab) {
      if (selected) complete(selected);
      return;
    }

    if (key.upArrow) {
      if (menuOpen) return setSel((s) => (s - 1 + items.length) % items.length);
      if (!moveVertical(-1)) recall(-1);
      return;
    }
    if (key.downArrow) {
      if (menuOpen) return setSel((s) => (s + 1) % items.length);
      if (!moveVertical(1)) recall(1);
      return;
    }
    if (key.leftArrow) return setCursor((p) => (key.ctrl || key.meta ? wordLeft(p) : Math.max(0, p - 1)));
    if (key.rightArrow) return setCursor((p) => Math.min(value.length, p + 1));
    if (key.home || (key.ctrl && input === 'a')) return setCursor(lineStart(cursor));
    if (key.end || (key.ctrl && input === 'e')) return setCursor(lineEnd(cursor));

    // Most terminals send the Backspace key as DEL, which Ink reports as `delete`.
    if (key.backspace || key.delete) {
      if (cursor === 0) return;
      const from = key.meta || key.ctrl ? wordLeft(cursor) : cursor - 1;
      return set(value.slice(0, from) + value.slice(cursor), from);
    }
    if (key.ctrl && input === 'w') {
      const from = wordLeft(cursor);
      return set(value.slice(0, from) + value.slice(cursor), from);
    }
    if (key.ctrl && input === 'u') return set(value.slice(0, lineStart(cursor)) + value.slice(cursor), lineStart(cursor));
    if (key.ctrl && input === 'k') return set(value.slice(0, cursor) + value.slice(lineEnd(cursor)), cursor);
    if (key.ctrl || (key.meta && input.length <= 1)) return;

    if (input) {
      // Typed characters, or a whole paste at once.
      const text = input.replace(/\r\n?/g, '\n').replace(/\t/g, '  ').replace(/[\x00-\x09\x0b-\x1f\x7f]/g, '');
      if (text) insert(text);
    }
  });

  // ---- render ----------------------------------------------------------------
  const isCommand = value.startsWith('/') && !value.includes('\n');
  const lines = value.split('\n');
  let offset = 0;

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor={isCommand ? c.accent : c.border} paddingX={1} flexDirection="column">
        {value === '' ? (
          <Text>
            <Text color={c.accent}>› </Text>
            <Text inverse> </Text>
            <Text color={c.muted}>Ask Solace anything, or type / for commands</Text>
          </Text>
        ) : (
          lines.map((line, i) => {
            const start = offset;
            offset += line.length + 1;
            const hasCursor = cursor >= start && cursor <= start + line.length;
            const col = cursor - start;
            const color = isCommand ? c.accent : undefined;
            return (
              <Text key={i}>
                <Text color={c.accent}>{i === 0 ? '› ' : '  '}</Text>
                {hasCursor ? (
                  <>
                    <Text color={color}>{line.slice(0, col)}</Text>
                    <Text inverse>{line[col] ?? ' '}</Text>
                    <Text color={color}>{line.slice(col + 1)}</Text>
                  </>
                ) : (
                  <Text color={color}>{line}</Text>
                )}
              </Text>
            );
          })
        )}
      </Box>
      {menuOpen ? <Menu items={items} selected={Math.min(sel, items.length - 1)} width={width} /> : null}
    </Box>
  );
}

function Menu({ items, selected, width }: { items: Item[]; selected: number; width: number }) {
  // Keep the selection in view.
  const start = Math.max(0, Math.min(selected - Math.floor(MAX_ROWS / 2), items.length - MAX_ROWS));
  const visible = items.slice(start, start + MAX_ROWS);
  const nameCol = Math.min(
    36,
    Math.max(...items.map((it) => (it.kind === 'cmd' ? `/${it.cmd.name}${it.cmd.args ? ' ' + it.cmd.args : ''}` : it.opt.label).length)) + 2,
  );
  const descWidth = Math.max(10, width - nameCol - 6);

  return (
    <Box flexDirection="column" paddingX={2}>
      {visible.map((it, i) => {
        const active = start + i === selected;
        const name = it.kind === 'cmd' ? `/${it.cmd.name}` : it.opt.label;
        const args = it.kind === 'cmd' && it.cmd.args ? ` ${it.cmd.args}` : '';
        let desc = it.kind === 'cmd' ? it.cmd.description : it.opt.hint ?? '';
        if (desc.length > descWidth) desc = desc.slice(0, descWidth - 1) + '…';
        const soon = it.kind === 'cmd' && it.cmd.soon;
        return (
          <Text key={name} wrap="truncate">
            <Text color={active ? c.accent : undefined} bold={active}>
              {name}
            </Text>
            <Text color={c.muted}>{args.padEnd(Math.max(args.length + 1, nameCol - name.length))}</Text>
            <Text color={active ? undefined : c.muted}>{desc}</Text>
            {soon ? <Text color={c.warn}> soon</Text> : null}
          </Text>
        );
      })}
      <Text color={c.muted}>
        {items.length > MAX_ROWS ? `${selected + 1}/${items.length} · ` : ''}↑↓ move · tab complete · enter run · esc close
      </Text>
    </Box>
  );
}
