import { useCallback, useEffect, useState } from 'react';
import { DELIBERATION_TIMER_ADD_SECONDS } from '@/src/game/roleReveal';

export function useDeliberationTimer(
  enabled: boolean,
  initialSeconds: number,
  resetKey: number
) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!enabled) return;
    setSecondsLeft(initialSeconds);
  }, [enabled, initialSeconds, resetKey]);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 0 : current - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [enabled, resetKey]);

  const skip = useCallback(() => {
    setSecondsLeft(0);
  }, []);

  const addTime = useCallback(() => {
    setSecondsLeft((current) => current + DELIBERATION_TIMER_ADD_SECONDS);
  }, []);

  return { secondsLeft, skip, addTime };
}
