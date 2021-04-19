import { useRef } from 'react';
import { useForceUpdate, useUnmount } from '../utils/react';
import { Reaction } from '../core/reaction';

export function useObserver<T>(fn: () => T) {
  const forceUpdate = useForceUpdate();
  const reaction = useRef<Reaction | null>(null);

  if (!reaction.current) {
    reaction.current = new Reaction(forceUpdate.bind(this));
  }

  const dispose = () => {
    if (reaction.current && !reaction.current.isDisposed) {
      reaction.current.dispose();
      reaction.current = null;
    }
  };

  useUnmount(dispose.bind(this));

  let rendering!: T;
  reaction.current.track(() => {
    rendering = fn();
  });

  return rendering;
}
