// Model badge component

import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme';

interface BadgeProps {
  label: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = c.accent }) => {
  return (
    <Box>
      <Text color={color}>● </Text>
      <Text>{label}</Text>
    </Box>
  );
};

export default Badge;
