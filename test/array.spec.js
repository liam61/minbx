'use strict';

const { observable } = require('../src');

test('array', () => {
  let a = observable([]);
  expect(a.length).toBe(0);
  expect(Object.keys(a)).toEqual([]);

  a[0] = 1;
  expect(a.length).toBe(1);
  expect(a.slice()).toEqual([1]);

  a.push(2);
  expect(a.length).toBe(2);
  expect(a.slice()).toEqual([1, 2]);

  a.splice(1, 1, 4, 5);
  expect(a.length).toBe(3);
  expect(a.slice()).toEqual([1, 4, 5]);

  a.splice(1, 1);
  expect(a.length).toBe(2);
  expect(a.slice()).toEqual([1, 5]);

  a.spliceWithArray(0, 0, [4, 3]);
  expect(a.length).toBe(4);
  expect(a.slice()).toEqual([4, 3, 1, 5]);

  a.spliceWithArray(-2, 1, [6]);
  expect(a.slice()).toEqual([4, 3, 6, 5]);

  a.spliceWithArray(2);
  expect(a.slice()).toEqual([4, 3]);

  a.length = 1;
  expect(a.slice()).toEqual([4]);

  a.length = 3;
  expect(a.length).toEqual(3);
  expect(a.slice()).toEqual([4, undefined, undefined]);

  a.pop();
  expect(a.length).toEqual(2);
  expect(a.slice()).toEqual([4, undefined]);

  a.splice(0, 2, 5, 3, 6);
  let sorted = a.sort((n1, n2) => n1 - n2);
  expect(sorted).toEqual([3, 5, 6]);
  expect(a.slice()).toEqual([5, 3, 6]);

  expect(a.get(1)).toBe(3);
  expect(a.get(3)).toBe(undefined);

  a.set(2, 4);
  expect(a.get(2)).toBe(4);
  expect(Object.keys(a)).toEqual(['0', '1', '2']);
});
