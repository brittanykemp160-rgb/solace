import { Box, Text } from 'ink';
import type { Account, Model } from '../../types';
import { formatTokens } from '../../lib/format';
import { planById } from '../../data/plans';
import { tildify } from '../paths';
import { c } from '../theme';

export function StatusBar({ folder, model, account, hint }: { folder: string; model: Model; account: Account; hint: string }) {
  const plan = planById(account.planId);
  const limit = plan.dailyTokens === null ? '' : ` / ${formatTokens(plan.dailyTokens)}`;
  return (
    <Box paddingX={2} justifyContent="space-between">
      <Text wrap="truncate">
        {hint ? (
          <Text color={c.warn}>{hint}</Text>
        ) : (
          <Text color={c.muted}>
            {tildify(folder)} · <Text color={model.logo === 'kimi' ? c.kimi : c.deepseek}>●</Text> {model.name}
          </Text>
        )}
      </Text>
      <Text color={c.muted} wrap="truncate">
        {formatTokens(account.tokensUsedToday)}
        {limit} tokens today · {plan.name}
        {account.signedIn ? '' : ' · Guest'}
      </Text>
    </Box>
  );
}
