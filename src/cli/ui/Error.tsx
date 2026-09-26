// Error display component

import React from 'react';
import { Box, Text } from 'ink';
import { c } from '../theme';

interface ErrorProps {
  message: string;
  details?: string;
}

export const Error: React.FC<ErrorProps> = ({ message, details }) => {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text color={c.error} bold>
        Error: {message}
      </Text>
      {details && (
        <Text color={c.muted} dimColor>
          {details}
        </Text>
      )}
    </Box>
  );
};

export default Error;
