// Horizontal divider

import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme';

interface DividerProps {
  width?: number;
  char?: string;
}

export const Divider: React.FC<DividerProps> = ({ width = 40, char = '─' }) => {
  return (
    <Box marginY={1}>
      <Text color={c.border}>{char.repeat(width)}</Text>
    </Box>
  );
};

export default Divider;
