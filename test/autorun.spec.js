'use strict';

const mobx = require('../src');
const { observable, autorun, computed } = mobx;

test('autorun-box', () => {
  const b = observable.box(1);
  const values = [];

  autorun(r => {
    expect(typeof r.track).toBe('function');
    expect(typeof r.schedule).toBe('function');
    values.push(b.get());
  });

  b.set(2);
  b.set(2);
  b.set('str');

  expect(values).toEqual([1, 2, 'str']);
});

test('autorun-object', () => {
  const o = observable({ a: 1, b: { c: 2 } });
  const values = [];

  autorun(() => {
    const _ = o.b;
    values.push(Object.keys(o));
  });

  o.a = 2;
  o.a = 2; // noop
  o.new = 'str';
  o.b.c = 3; // noop
  o.b = { d: 'reset' };

  expect(values).toEqual([
    ['a', 'b'],
    ['a', 'b', 'new'],
    ['a', 'b', 'new'],
  ]);
});

test('autorun-array', () => {
  const a = observable([1, null, 'str']);
  const values = [];

  autorun(() => {
    const _ = a[0];
    values.push(a.slice());
  });

  a[1] = true;
  a.pop();
  a.forEach(() => {}); // noop
  a.length = 4;

  expect(values).toEqual([
    [1, null, 'str'],
    [1, true, 'str'],
    [1, true],
    [1, true, undefined, undefined],
  ]);
});

test('autorun-compute', () => {
  const b = observable.box(3);
  const c = computed(() => b.get() * 2);
  const values = [];

  autorun(() => {
    values.push(c.get());
  });

  b.set(2);
  b.set(2); // noop
  b.set(4);

  // expect(values).toEqual([6, 4, 8]);
  expect(values).toEqual([6, 4, 4, 8, 8]);
});

// observable 被 computed 和 reaction 依赖，同时 computed 也被 reaction 依赖
test('autorun-complex1', () => {
  class Store {
    @observable obj = { a: 1 };
    @observable arr = [2, 3];
    @observable str = 'hello';
    @observable bool = false;
    @observable num = 4;
    @computed get mixed() {
      return store.str + '/' + store.num;
    }
  }

  const store = new Store();
  const values = [];

  autorun(r => {
    if (!store.bool) {
      values.push([store.str, store.arr.slice()]);
    } else {
      store.str = 'change-in-autorun'; // computed 也依赖 str
      values.push([store.str, store.obj.a, store.mixed]);
    }
  });

  store.bool = true;

  expect(values).toEqual([
    ['hello', [2, 3]],
    ['change-in-autorun', 1, 'change-in-autorun/4'],
    ['change-in-autorun', 1, 'change-in-autorun/4'],
  ]);
});

// observable 被 computed 和 reaction 依赖，同时 computed 也被 reaction 依赖
test('autorun-complex2', () => {
  class Store {
    @observable obj = { a: 1 };
    @observable str = 'hello';
    @observable num = 4;
    @computed get mixed() {
      return store.str + '/' + store.num;
    }
    @computed get dbl() {
      return store.mixed + '/dbl';
    }
  }

  const store = new Store();
  const values = [];

  autorun(r => {
    values.push([store.str, store.obj.a, store.dbl]);
  });

  store.str = 'change';

  // NOTE: 收集依赖没做优化，会多次执行
  expect(values).toEqual([
    ['hello', 1, 'hello/4/dbl'],
    ['change', 1, 'change/4/dbl'],
    ['change', 1, 'change/4/dbl'],
    ['change', 1, 'change/4/dbl'],
    ['change', 1, 'change/4/dbl'],
  ]);
});
