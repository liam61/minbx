'use strict';

const mobx = require('../src');
const { observable, $mobx, set, get, has } = mobx;

test('object-api', () => {
  const o = observable({ a: 1, b: 'str', c: [2, 3], d: { e: 4 } });

  expect(has(o, 'a')).toBe(true);
  expect(has(o, 'c')).toBe(true);
  expect(has(o.c, '1')).toBe(true);
  expect(has(o.c, 4)).toBe(false);

  let t = get(o, 'c');
  expect(t[$mobx].isObservableArray).toBe(true);

  t = get(o, 'd');
  expect(t[$mobx].isObservableObject).toBe(true);

  set(o, 'a', 2);
  expect(get(o, 'a')).toBe(2);

  set(o, 'b', [5, 6]);
  t = get(o, 'b');
  expect(t[$mobx].isObservableArray).toBe(true);
  expect(t.length).toBe(2);

  set(o.c, 3, [5]);
  expect(o.c).toEqual([2, 3, undefined, [5]]);
  // console.log(o.c);

  set(o, 'new', { f: 7 });
  t = get(o, 'new');
  expect(t[$mobx].isObservableObject).toBe(true);

  set(o, { g: 8, h: 9 });
  expect(get(o, 'g')).toBe(8);
  expect(Object.keys(o)).toEqual(['a', 'b', 'c', 'd', 'new', 'g', 'h']);
});
