import { Component, render } from 'preact';

interface ILight {
  id: number;
  color: [number, number, number];
}

interface Event {
  duration: number;
  payload: {
    ids: number[];
  } & Omit<ILight, 'id'>;
}

class App extends Component {
  render() {
    return null;
  }
}

render(<App />, document.body);