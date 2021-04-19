import {
  isObservableArray,
  isObservableObject,
  isObservable,
  $mobx,
} from '../utils';
import { startBatch, endBatch } from '../core/globalstate';

export function set(obj: any, key: any, value?: any): void {
  if (arguments.length === 2) {
    startBatch();
    try {
      Object.entries(key).forEach(([k, v]) => set(obj, k, v));
    } finally {
      endBatch();
    }
    return;
  }

  if (isObservableObject(obj)) {
    const adm = obj[$mobx];
    adm.values.get(key)
      ? adm.write(key, value)
      : adm.addObservableProp(key, value);
  } else if (isObservableArray(obj) && typeof key === 'number') {
    startBatch();
    if (key >= obj.length) obj.length = key + 1;
    obj[key] = value;
    endBatch();
  } else throw new Error('type error');
}

export function has(obj: any, key: any): boolean {
  if (isObservableObject(obj)) return obj[$mobx].has(key);
  else if (isObservableArray(obj)) return +key >= 0 && +key < obj.length;
  else throw new Error('type error');
}

export function get(obj: any, key: any) {
  if (!has(obj, key)) return;
  if (isObservable(obj)) return obj[key];
  else throw new Error('type error');
}
