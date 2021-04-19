'use strict';

const mobx = require('../src');
const { observable, $mobx } = mobx;

test('object', () => {
  const o = observable({ a: 1, b: 'str', c: [2, 3], d: { e: 4 } });
  expect(o[$mobx].isObservableObject).toBe(true);
  expect(Object.keys(o)).toEqual(['a', 'b', 'c', 'd']);

  expect(o.a).toBe(1);
  expect(o.b).toBe('str');

  const c = o.c;
  expect(c[$mobx].isObservableArray).toBe(true);
  expect(c.length).toBe(2);
  expect(c[1]).toBe(3);
  c.splice(1, 0, 4);
  expect(c.slice()).toEqual([2, 4, 3]);

  const d = o.d;
  expect(d[$mobx].isObservableObject).toBe(true);
  expect(d.e).toBe(4);

  d.new = { f: 5 };
  expect(d.new[$mobx].isObservableObject).toBe(true);
  expect(d.new.f).toBe(5);
  expect(Object.keys(d)).toEqual(['e', 'new']);
});
