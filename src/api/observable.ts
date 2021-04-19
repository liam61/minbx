import { ObservableValue } from './../types/observablevalue';
import {
  createObservableArray,
  IObservableArray,
} from '../types/observablearray';
import {
  createObservableObject,
  asObservableObject,
} from '../types/observableobject';
import { isPlainObject, isObservable, createPropDecorator } from '../utils';

export interface IObservableFactory {
  (value: number | string | null | undefined | boolean): never; // use box
  (target: Object, key: string | symbol, descriptor?: PropertyDescriptor): any; // decorator
  <T = any>(value: T[]): IObservableArray<T>;
  <T extends Object>(value: T): T;
}

const observableFactories = {
  box<T = any>(value: T) {
    return new ObservableValue<T>(value);
  },
  array<T = any>(initialValues?: T[]) {
    return createObservableArray<T>(initialValues);
  },
  object<T = any>(props: T): T {
    return createObservableObject<T>(props);
  },
};

function createObservable(v: any, arg2?: any) {
  // console.log(arguments);
  // @observable someProp;
  if (typeof arg2 === 'string')
    // @ts-ignore
    return observableDecorator.apply(null, arguments);

  if (isObservable(v)) return v;
  if (Array.isArray(v)) return observable.array(v);
  if (isPlainObject(v)) return observable.object(v);
  return v;
}

export const observable: IObservableFactory &
  typeof observableFactories = createObservable as any;

Object.keys(observableFactories).forEach(
  name => (observable[name] = observableFactories[name]),
);

export const observableDecorator = createPropDecorator(
  (target, prop: PropertyKey, descriptor, _args) => {
    const initialValue = descriptor
      ? descriptor.initializer
        ? descriptor.initializer.call(target)
        : descriptor.value
      : undefined;
    return asObservableObject(target).addObservableProp(prop, initialValue);
  },
);
