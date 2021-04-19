import { IDerivation } from './derivation';
import { Reaction, runReactions } from './reaction';

export const globalState = {
  inBatch: 0,
  UNCHANGED: {},
  trackingDerivation: (null as unknown) as IDerivation,
  pendingReactions: [] as Reaction[],
  runId: 0,
  isRunningReactions: false,
};

export function startBatch() {
  globalState.inBatch++;
}

export function endBatch() {
  if (--globalState.inBatch === 0) {
    runReactions();
  }
}
