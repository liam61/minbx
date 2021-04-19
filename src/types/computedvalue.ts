import {
  IObservable,
  reportObserved,
  propagateChanged,
} from '../core/observable';
import { IDerivation, trackDerivedFunction } from '../core/derivation';
import { globalState, startBatch, endBatch } from '../core/globalstate';

export interface IComputedValue<T> {
  get(): T;
}

export interface IComputedValueOptions<T> {
  get: () => T;
  context?: any;
}

export class ComputedValue<T>
  implements IComputedValue<T>, IObservable, IDerivation {
  diffValue = 0;
  observing: IObservable[] = [];
  newObserving: IObservable[] = [];
  runId = 0;
  observers = new Set<IDerivation>();
  lastAccessedBy = 0;
  protected value: T | undefined;
  derivation: () => T;
  scope: any;
  isComputedValue = true;

  constructor(options: IComputedValueOptions<T>) {
    this.derivation = options.get;
    this.scope = options.context;
  }

  onBecomeStale() {
    propagateChanged(this);
  }

  get(): T {
    if (globalState.inBatch === 0 && this.observers.size === 0) {
      startBatch();
      this.value = this.derivation.call(this.scope);
      endBatch();
    } else {
      reportObserved(this);
      const newValue = trackDerivedFunction(this, this.derivation, this.scope);
      if (!Object.is(this.value, newValue)) {
        this.value = newValue;
        this.onBecomeStale();
      }
    }
    return this.value!;
  }

  toJSON() {
    return this.get();
  }
}
