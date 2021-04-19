import { ObservableValue } from './observablevalue';
import { globalState } from '../core/globalstate';
import { Atom } from '../core/atom';
import { addHiddenProp, $mobx, isPropertyKey } from '../utils';
import { set } from '../api/object-api';
import { ComputedValue, IComputedValueOptions } from './computedvalue';
import { extendObservable } from '../api/extendobservable';

export class ObservableObjectAdministration {
  atom = new Atom();
  isObservableObject = true;

  constructor(
    public target: any,
    public values = new Map<
      PropertyKey,
      ObservableValue<any> | ComputedValue<any>
    >(),
  ) {}

  read(key: PropertyKey) {
    return this.values.get(key)!.get();
  }

  write(key: PropertyKey, newValue: any) {
    const observable = this.values.get(key);
    if (observable instanceof ComputedValue) return;

    newValue = (observable as any).prepareNewValue(newValue);
    if (newValue !== globalState.UNCHANGED) {
      observable!.setNewValue(newValue);
    }
  }

  addObservableProp(propName: PropertyKey, newValue: any) {
    const observable = new ObservableValue(newValue);
    this.values.set(propName, observable);
    newValue = (observable as any).value;
    Object.defineProperty(this.target, propName, getObservableConfig(propName));
    this.atom.reportChanged();
  }

  addComputedProp(propName: PropertyKey, options: IComputedValueOptions<any>) {
    this.values.set(propName, new ComputedValue(options));
    this.target === options.context &&
      Object.defineProperty(this.target, propName, getComputedConfig(propName));
  }

  has(key: PropertyKey) {
    return this.values.has(key);
  }
}

export function asObservableObject(
  target: any,
): ObservableObjectAdministration {
  if (Object.prototype.hasOwnProperty.call(target, $mobx)) return target[$mobx];
  const adm = new ObservableObjectAdministration(target, new Map());
  addHiddenProp(target, $mobx, adm);
  return adm;
}

function getObservableConfig(propName: PropertyKey) {
  return {
    configurable: true,
    enumerable: true,
    get() {
      return this[$mobx].read(propName);
    },
    set(v: any) {
      this[$mobx].write(propName, v);
    },
  };
}

function getComputedConfig(propName: PropertyKey) {
  return {
    configurable: false,
    enumerable: false,
    get() {
      return this[$mobx].read(propName);
    },
    // set(v: any) {},
  };
}

export function createObservableObject<T>(props: T): T {
  const proxy = new Proxy(
    {},
    {
      get(target: any, name: PropertyKey) {
        const o = target[$mobx].values.get(name);
        if (o instanceof Atom) return (o as any).get();
        return target[name];
      },
      set(target: any, name: PropertyKey, value: any) {
        if (!isPropertyKey(name)) return false;
        set(target, name, value);
        return true;
      },
      ownKeys(target) {
        target[$mobx].atom.reportObserved();
        return Reflect.ownKeys(target);
      },
    },
  );

  return extendObservable(proxy, props);
}
