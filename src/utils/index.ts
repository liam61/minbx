export * from './decorators';

export const $mobx = Symbol('mobx administration');

const arrayProto = Object.getPrototypeOf([]);

export function isOriginArrayFnName(name: string) {
  if (['length', 'constructor'].includes(name)) return false;
  return arrayProto.hasOwnProperty(name);
}

export function isNumberLike(name: any) {
  return (
    typeof name === 'number' ||
    (typeof name === 'string' && !isNaN(name as any))
  );
}

export function addHiddenProp(object: any, propName: PropertyKey, value: any) {
  Object.defineProperty(object, propName, {
    configurable: true,
    writable: true,
    value,
  });
}

export function isPlainObject(value: any) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isObservable(value: any) {
  if (value == null) return false;
  return !!value[$mobx];
}

export function isObservableObject(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableObject;
}

export function isObservableArray(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableArray;
}

export function isPropertyKey(val: any) {
  return ['string', 'number', 'symbol'].includes(typeof val);
}
