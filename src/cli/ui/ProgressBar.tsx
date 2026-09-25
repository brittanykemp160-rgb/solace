// Progress bar component

import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme';

interface ProgressBarProps {
  value: number;
  max: number;
  width?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, width = 20 }) => {
  const percent = Math.min(value / max, 1);
  const filled = Math.round(width * percent);
  const empty = width - filled;

  return (
    <Box>
      <Text color={c.accent}>{'█'.repeat(filled)}</Text>
      <Text color={c.border}>{'░'.repeat(empty)}</Text>
      <Text color={c.muted}> {Math.round(percent * 100)}%</Text>
    </Box>
  );
};

export default ProgressBar;
