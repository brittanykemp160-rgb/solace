// Tool step display

import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme';
import type { ToolStep as ToolStepType } from '../../types';

const ICONS: Record<string, string> = {
  read: '📖',
  edit: '✏️',
  run: '⚡',
  search: '🔍',
};

interface ToolStepProps {
  step: ToolStepType;
}

export const ToolStep: React.FC<ToolStepProps> = ({ step }) => {
  const icon = ICONS[step.kind] || '●';

  return (
    <Box>
      <Text>{icon} </Text>
      <Text color={c.muted}>{step.label}</Text>
      {step.detail && (
        <Text color={c.border} dimColor> {step.detail}</Text>
      )}
    </Box>
  );
};

export default ToolStep;
