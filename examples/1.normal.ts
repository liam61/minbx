import { observable, computed, autorun } from '../src';
// import { observable, computed, autorun } from 'minbx';

export default function demo1() {
  // const a = observable({
  //   a: 1,
  //   b: 'str',
  //   c: true,
  //   d: null,
  //   e: [2, 3, 4],
  //   f: { g: false, h: 6 },
  //   i: { j: 1, k: [6, 7, 8], l: { m: 'obj', n: undefined } },
  //   o: [{ id: 1 }, { id: 2 }],
  // });
  // console.log(a);
  // window.aa = a;

  class Store {
    @observable obj = { a: 1 };
    @observable arr = [2, 3];
    @observable str = 'hello';
    @observable bool = true;
    @observable num = 4;
    @computed get mixed() {
      return this.str + '/' + this.num;
    }
    @computed get dbl() {
      return this.mixed + '/dbl';
    }
  }

  const store = new Store();

  // autorun(r => {
  //   if (!store.bool) {
  //     console.log('auto', store.str, store.arr);
  //   } else {
  //     // store.str = 'change-in-autorun'; // computed 也依赖 str
  //     console.log('auto2', store.str, store.obj.a, store.mixed);
  //     // console.log('auto2', store.str);
  //   }
  // });

  autorun(r => {
    console.log('auto', store.str, store.obj.a, store.dbl);
  });

  store.str = 'change';
}
