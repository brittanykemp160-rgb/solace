// /usage command handler

import { formatTokens } from '../../lib/format';
import { planById } from '../../data/plans';

interface UsageData {
  tokensUsed: number;
  planId: string;
}

export const handleUsage = (usage: UsageData): string => {
  const plan = planById(usage.planId as any);
  const limit = plan.dailyTokens;
  const used = formatTokens(usage.tokensUsed);
  const max = limit ? formatTokens(limit) : 'Unlimited';

  return `Today: ${used} / ${max} tokens (${plan.name} plan)`;
};
