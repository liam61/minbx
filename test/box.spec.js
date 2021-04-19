'use strict';

const mobx = require('../src');
const { observable } = mobx;

test('box', function() {
  let b = observable.box(3);
  expect(b.isObservableValue).toBe(true);

  expect(b.get()).toBe(3);

  b.set(5);
  expect(b.get()).toBe(5);
});
