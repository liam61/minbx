import { memo, FC } from 'react';
import { useObserver } from './useObserver';

export function observer<P extends object>(baseComponent: FC<P>): FC<P> {
  return memo((props: P, ref) => useObserver(() => baseComponent(props, ref)));
}
