import {
  IDerivation,
  trackDerivedFunction,
  clearObserving,
} from './derivation';
import { IObservable } from './observable';
import { globalState, endBatch, startBatch } from './globalstate';

export class Reaction implements IDerivation {
  observing: IObservable[] = [];
  newObserving: IObservable[] = [];
  runId = 0;
  isDisposed = false;

  constructor(private onInvalidate: () => void) {}

  onBecomeStale() {
    this.schedule();
  }

  schedule() {
    globalState.pendingReactions.push(this);
    runReactions();
  }

  runReaction() {
    if (this.isDisposed) return;
    startBatch();
    this.onInvalidate();
    endBatch();
  }

  track(fn: () => void) {
    if (this.isDisposed) return;
    startBatch();
    trackDerivedFunction(this, fn, undefined);
    this.isDisposed && clearObserving(this);

    endBatch();
  }

  dispose() {
    if (!this.isDisposed) {
      this.isDisposed = true;
      startBatch();
      clearObserving(this);
      endBatch();
    }
  }
}

export function runReactions() {
  if (globalState.inBatch > 0) return;
  const allReactions = globalState.pendingReactions;

  while (allReactions.length > 0) {
    const remainingReactions = allReactions.splice(0);
    remainingReactions.forEach(rr => rr.runReaction());
  }
}
