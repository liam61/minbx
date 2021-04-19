import { createPropDecorator } from '../utils';
import { asObservableObject } from '../types/observableobject';
import {
  ComputedValue,
  IComputedValueOptions,
  IComputedValue,
} from '../types/computedvalue';

export interface IComputed {
  <T>(): any; // decorator
  <T>(func: () => T): IComputedValue<T>; // normal usage
  (target: Object, key: string | symbol, descriptor?: PropertyDescriptor): void; // decorator
}

export const computed: IComputed = function(arg1: any, arg2: any, arg3: any) {
  // @computed
  // @ts-ignore
  if (typeof arg2 === 'string') return computedDecorator.apply(null, arguments);

  // computed(expr, options?)
  const opts: IComputedValueOptions<any> = typeof arg2 === 'object' ? arg2 : {};
  opts.get = arg1;
  return new ComputedValue(opts);
} as any;

export const computedDecorator = createPropDecorator(
  (instance, prop: PropertyKey, descriptor, _args) => {
    return asObservableObject(instance).addComputedProp(prop, {
      get: descriptor.get!,
      context: instance,
    });
  },
);
