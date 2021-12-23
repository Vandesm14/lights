import { Component, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

function Item({ evt }: { evt: string }) {
  const [event, setEvent] = useState('');

  useEffect(function() {
    setEvent(evt);
  }, [evt]);

  return <h1>{event}</h1>;
}

class App extends Component {
  state = {
    event: '',
  };

  componentDidMount() {
    document.addEventListener('keydown', this.trigger);
  }

  trigger = (e: KeyboardEvent) => {
    this.setState({ event: e.key });
  }

  render({}, { event }) {
    return (
      <main id="app">
        <Item evt={event} />
      </main>
    );
  }
}

render(<App />, document.body);