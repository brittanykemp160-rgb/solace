import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import type { Model, Plan } from '../../types';
import { formatTokens } from '../../lib/format';
import { tildify } from '../paths';
import { c, LOGO } from '../theme';

export function Welcome({ version, folder, model, plan, used, width }: { version: string; folder: string; model: Model; plan: Plan; used: number; width: number }) {
  const row = (label: string, value: ReactNode) => (
    <Text>
      <Text color={c.muted}>{label.padEnd(8)}</Text>
      {value}
    </Text>
  );
  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="round" borderColor={c.accent} paddingX={2} paddingY={0} width={Math.min(width, 64)}>
        <Text>
          <Text color={c.accent}>{LOGO} </Text>
          <Text bold>Welcome to Solace</Text>
          <Text color={c.muted}> v{version}</Text>
        </Text>
        <Text color={c.muted}>Your free AI coding agent.</Text>
        <Text> </Text>
        {row('folder', tildify(folder))}
        {row('model', model.name)}
        {row('plan', `${plan.name} · ${formatTokens(used)} of ${plan.dailyTokens === null ? 'unlimited' : formatTokens(plan.dailyTokens)} tokens used today`)}
      </Box>
      <Box paddingLeft={1} marginTop={1}>
        <Text color={c.muted}>
          Ask Solace to build, fix or explain something. Type <Text color={c.accent}>/</Text> for commands,{' '}
          <Text color={c.accent}>/help</Text> for shortcuts.
        </Text>
      </Box>
    </Box>
  );
}
