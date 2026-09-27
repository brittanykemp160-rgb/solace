// Selection menu component

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { c } from '../theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  onSelect: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ options, onSelect }) => {
  const [selected, setSelected] = useState(0);

  useInput((_, key) => {
    if (key.upArrow) {
      setSelected(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelected(prev => Math.min(options.length - 1, prev + 1));
    } else if (key.return) {
      onSelect(options[selected].value);
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((option, i) => (
        <Box key={option.value}>
          <Text color={i === selected ? c.accent : c.muted}>
            {i === selected ? '❯ ' : '  '}
          </Text>
          <Text color={i === selected ? c.user : c.muted}>
            {option.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default Select;
