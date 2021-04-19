import React from 'react';
import { render } from 'react-dom';
import { observable, computed, observer, Observer } from '../src';
// import { observable, computed, observer, Observer } from '../lib/mobx.es6.js';
// import { observable, computed, observer, Observer } from 'minbx';

class Store {
  @observable arr = [2, 3];
  @observable str = 'hello';
  @observable num = 4;
  @observable bool = true;
  @computed get mixed() {
    return this.str + '/' + this.num;
  }

  change = () => {
    this.num += 1;
  };

  toggle = () => {
    this.bool = !this.bool;
  };

  add = () => {
    this.arr.push(Math.floor(Math.random() * 1000));
  };
}

const store = new Store();

const App = observer(() => {
  return (
    <div style={{ fontSize: 14, textAlign: 'center' }}>
      <h3>this is App Component</h3>
      <div>observable: {store.num}</div>
      <div>compute: {store.mixed}</div>
      <button onClick={store.change} style={{ marginBottom: 5 }}>
        click to add num
      </button>
      <br />
      <button onClick={store.toggle}>click to un/mount Inner Component</button>
      {store.bool && <Observer>{Inner}</Observer>}
    </div>
  );
});

const Inner = () => {
  return (
    <div>
      <h3>this is Inner Component</h3>
      <ul>
        {store.arr.map(num => (
          <li key={num} style={{ listStyle: 'none' }}>
            {num}
          </li>
        ))}
      </ul>
      <button onClick={store.add}>click to add item</button>
    </div>
  );
};

export default function renderToContainer() {
  render(<App />, document.getElementById('app'));
}
