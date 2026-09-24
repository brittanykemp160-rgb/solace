// Styled box component

import React from 'react';
import { Box as InkBox, Text } from 'ink';
import { c } from '../theme';

interface BoxProps {
  title?: string;
  children: React.ReactNode;
  borderColor?: string;
  padding?: number;
}

export const Box: React.FC<BoxProps> = ({
  title,
  children,
  borderColor = c.border,
  padding = 1,
}) => {
  return (
    <InkBox
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      paddingX={padding}
    >
      {title && (
        <Text color={c.accent} bold>
          {title}
        </Text>
      )}
      {children}
    </InkBox>
  );
};

export default Box;
