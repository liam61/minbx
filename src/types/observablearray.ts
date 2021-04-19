import { observable } from '../api/observable';
import { Atom } from './../core/atom';
import {
  addHiddenProp,
  $mobx,
  isOriginArrayFnName,
  isNumberLike,
} from '../utils';

export interface IObservableArray<T = any> extends Array<T> {
  spliceWithArray(index: number, deleteCount?: number, newItems?: T[]): T[];
  toJSON(): T[];
}

class ObservableArrayAdministration {
  values: any[] = [];
  atom = new Atom();
  isObservableArray = true;

  getArrayLength() {
    this.atom.reportObserved();
    return this.values.length;
  }

  setArrayLength(newLength: number) {
    const len = this.values.length;
    if (typeof newLength !== 'number' || newLength < 0 || newLength === len)
      return;
    if (newLength > len) {
      const newItems = Array.from({ length: newLength - len });
      this.spliceWithArray(len, 0, newItems);
    } else this.spliceWithArray(newLength, len - newLength);
  }

  spliceWithArray(index = 0, deleteCount?: number, newItems?: any[]): any[] {
    const len = this.values.length;

    if (index > len) index = len;
    else if (index < 0) index = Math.max(0, len + index);

    if (arguments.length === 1) deleteCount = len - index;
    else if (deleteCount == null) deleteCount = 0;
    else deleteCount = Math.max(0, Math.min(deleteCount, len - index));

    newItems =
      newItems && newItems.length ? newItems.map(v => observable(v)) : [];
    const res = this.values.splice(index, deleteCount, ...newItems);

    if (deleteCount !== 0 || newItems.length !== 0) this.atom.reportChanged();
    return res;
  }
}

export function createObservableArray<T>(
  initialValues: any[] = [],
): IObservableArray<T> {
  const adm = new ObservableArrayAdministration();
  addHiddenProp(adm.values, $mobx, adm);
  const proxy = new Proxy(adm.values, {
    get(target: any, name: any) {
      if (name === 'length') return target[$mobx].getArrayLength();
      if (isNumberLike(name)) return arrayExtensions.get.call(target, +name);
      if (arrayExtensions.hasOwnProperty(name)) return arrayExtensions[name];

      return isOriginArrayFnName(name)
        ? getRestOriginArrayFn(name, target[$mobx])
        : target[name];
    },
    set(target: any, name: any, value: any): boolean {
      if (name === 'length') target[$mobx].setArrayLength(value);
      if (isNumberLike(name)) arrayExtensions.set.call(target, +name, value);
      else target[name] = value;

      return true;
    },
  });

  adm.spliceWithArray(0, 0, initialValues);
  return proxy;
}

const arrayExtensions = {
  splice(index: number, deleteCount?: number, ...newItems: any[]) {
    const adm: ObservableArrayAdministration = this[$mobx];
    switch (arguments.length) {
      case 0:
        return [];
      case 1:
        return adm.spliceWithArray(index);
      case 2:
        return adm.spliceWithArray(index, deleteCount);
    }
    return adm.spliceWithArray(index, deleteCount, newItems);
  },
  spliceWithArray(
    index: number,
    deleteCount?: number,
    newItems?: any[],
  ): any[] {
    return this[$mobx].spliceWithArray(...arguments);
  },
  push(...items: any[]) {
    const adm: ObservableArrayAdministration = this[$mobx];
    adm.spliceWithArray(adm.values.length, 0, items);
    return adm.values.length;
  },
  pop() {
    return this.splice(Math.max(this[$mobx].values.length - 1, 0), 1)[0];
  },
  sort(compareFn?: (a: any, b: any) => number): any[] {
    const clone = this.slice();
    return clone.sort(compareFn);
  },
  toJSON(): any[] {
    return this.slice();
  },
  get(index: number) {
    const adm: ObservableArrayAdministration = this[$mobx];
    if (index >= adm.values.length) return undefined;
    adm.atom.reportObserved();
    return adm.values[index];
  },
  set(index: number, newValue: any) {
    const adm: ObservableArrayAdministration = this[$mobx];
    const values = adm.values;
    if (index < values.length) {
      const oldValue = values[index];
      newValue = observable(newValue);
      if (newValue !== oldValue) {
        values[index] = newValue;
        adm.atom.reportChanged();
      }
    } else if (index === values.length) {
      adm.spliceWithArray(index, 0, [newValue]);
    } else throw new Error('index error');
  },
};

const fnCache = {};

function getRestOriginArrayFn(
  name: string,
  adm: ObservableArrayAdministration,
) {
  if (fnCache[name] && fnCache[name].adm === adm) return fnCache[name];
  function fn() {
    adm.atom.reportObserved();
    const res = adm.values;
    return res[name].apply(res, arguments);
  }
  fn.adm = adm;
  fnCache[name] = fn;
  return fn;
}
