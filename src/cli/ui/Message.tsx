import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import type { ToolStep } from '../../types';
import { Markdown } from '../utils/markdown';
import { c } from '../theme';
import { tildify } from '../paths';

export type Entry =
  | { id: string; kind: 'welcome' }
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'assistant'; text: string; steps?: ToolStep[]; stopped?: boolean }
  | { id: string; kind: 'notice'; body: ReactNode }
  | { id: string; kind: 'error'; text: string }
  | { id: string; kind: 'divider'; label: string };

export function UserMessage({ text }: { text: string }) {
  return (
    <Box marginTop={1} paddingX={1}>
      <Text color={c.muted}>› </Text>
      <Text color={c.user}>{text}</Text>
    </Box>
  );
}

export function Steps({ steps }: { steps: ToolStep[] }) {
  return (
    <Box flexDirection="column">
      {steps.map((s, i) => (
        <Text key={i}>
          <Text color={c.muted}>● </Text>
          <Text bold>{s.label}</Text>
          {s.detail ? <Text color={c.muted}> {tildify(s.detail)}</Text> : null}
        </Text>
      ))}
    </Box>
  );
}

export function AssistantMessage({ text, steps, stopped }: { text: string; steps?: ToolStep[]; stopped?: boolean }) {
  return (
    <Box flexDirection="column" marginTop={1} paddingX={1}>
      {steps?.length ? <Steps steps={steps} /> : null}
      {text ? (
        <Box>
          <Text color={c.accent}>● </Text>
          <Box flexDirection="column" flexGrow={1}>
            <Markdown text={text} />
          </Box>
        </Box>
      ) : null}
      {stopped ? <Text color={c.muted}>  ⎿ Stopped</Text> : null}
    </Box>
  );
}

/** Output of a slash command, indented under the prompt like a tool result. */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <Box marginTop={1} paddingX={1}>
      <Text color={c.muted}>⎿ </Text>
      <Box flexDirection="column" flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}

export function EntryView({ e, welcome }: { e: Entry; welcome: ReactNode }) {
  switch (e.kind) {
    case 'welcome':
      return <>{welcome}</>;
    case 'user':
      return <UserMessage text={e.text} />;
    case 'assistant':
      return <AssistantMessage text={e.text} steps={e.steps} stopped={e.stopped} />;
    case 'notice':
      return <Notice>{e.body}</Notice>;
    case 'error':
      return (
        <Notice>
          <Text color={c.error}>{e.text}</Text>
        </Notice>
      );
    case 'divider':
      return (
        <Box marginTop={1} paddingX={1}>
          <Text color={c.muted}>── {e.label} ──</Text>
        </Box>
      );
  }
}
