// Input handling hook

import { useState, useCallback } from 'react';
import { addToHistory, getPreviousCommand, getNextCommand, resetPosition } from '../services/history';

export const useInput = () => {
  const [value, setValue] = useState('');

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const handleSubmit = useCallback((callback: (value: string) => void) => {
    const trimmed = value.trim();
    if (trimmed) {
      addToHistory(trimmed);
      callback(trimmed);
      setValue('');
      resetPosition();
    }
  }, [value]);

  const handleUp = useCallback(() => {
    const prev = getPreviousCommand();
    if (prev !== undefined) {
      setValue(prev);
    }
  }, []);

  const handleDown = useCallback(() => {
    const next = getNextCommand();
    if (next !== undefined) {
      setValue(next);
    }
  }, []);

  return {
    value,
    setValue: handleChange,
    submit: handleSubmit,
    up: handleUp,
    down: handleDown,
  };
};
