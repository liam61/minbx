import { IDerivation } from './derivation';
import { globalState } from './globalstate';

export interface IObservable {
  diffValue: number;
  observers: Set<IDerivation>;
  lastAccessedBy: number;
}

export function reportObserved(observable: IObservable) {
  const derivation = globalState.trackingDerivation;
  if (!derivation) return false;

  if (observable.lastAccessedBy !== derivation.runId) {
    // 本轮已收集则跳过
    observable.lastAccessedBy = derivation.runId;
    derivation.newObserving.push(observable);
  }
  return true;
}

export function propagateChanged(observable: IObservable) {
  // NOTE:
  // 这里剔除了 mobx 的 IDerivationState 状态管理
  // 单纯的对 observable 的监听者进行遍历通知
  // 所以在针对含 compute 嵌套依赖的情况下会出现重复收集依赖
  observable.observers.forEach(d => {
    d.onBecomeStale();
  });
}
