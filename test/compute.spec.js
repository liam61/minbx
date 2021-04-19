'use strict';

const mobx = require('../src');
const { observable, computed, set } = mobx;

test('compute', () => {
  const a = observable([1, 2, 3]);
  const o = observable({ a: 1, b: 2 });
  let c = computed(() => a.reduce((a, b) => a + b, 0));

  expect(c.isComputedValue).toBe(true);
  expect(c.get()).toBe(6);

  a[1] = 4;
  expect(c.get()).toBe(8);

  a.push(5);
  expect(c.get()).toBe(13);

  a.length = 6;
  expect(isNaN(c.get())).toBe(true);

  c = computed(() => Object.keys(o));
  expect(c.get()).toEqual(['a', 'b']);
  expect(c.toJSON()).toEqual(['a', 'b']);

  o.new = { c: 3 };
  expect(c.get()).toEqual(['a', 'b', 'new']);

  set(o, { d: 4 });
  expect(c.get()).toEqual(['a', 'b', 'new', 'd']);
});
