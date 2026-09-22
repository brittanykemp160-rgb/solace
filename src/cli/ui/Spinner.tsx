import { Text } from 'ink';
import { useEffect, useState } from 'react';
import { c } from '../theme';

// The logo's half-sun, turning: ◐ ◓ ◑ ◒
const FRAMES = ['◐', '◓', '◑', '◒'];
const WORDS = ['Thinking', 'Reading', 'Working', 'Writing'];

export function Spinner({ startedAt, label }: { startedAt: number; label?: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 120);
    return () => clearInterval(t);
  }, []);
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const word = label ?? WORDS[Math.floor(tick / 25) % WORDS.length];
  return (
    <Text>
      <Text color={c.accent}>{FRAMES[tick % FRAMES.length]} </Text>
      <Text>{word}…</Text>
      <Text color={c.muted}>
        {'  '}
        {secs}s · esc to stop
      </Text>
    </Text>
  );
}
