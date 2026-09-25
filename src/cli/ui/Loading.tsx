// Loading indicator

import React from 'react';
import { Box, Text } from 'ink';
import Spinner from './Spinner';
import { c } from '../theme';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <Box>
      <Spinner />
      <Text color={c.muted}> {message}</Text>
    </Box>
  );
};

export default Loading;
