import { useState, useCallback, useEffect } from 'react';

export function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick(t => t + 1), []);
}

export function useUnmount(fn: () => void) {
  useEffect(() => fn, []);
}
