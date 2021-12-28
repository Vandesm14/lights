import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';

import { newList } from './shared';
import type { Light } from './shared';
import { Editor } from './editor';
import { Viewer } from './viewer';

const App = () => {
  const fillLights = (height = 8, width = 8, defaultProps?: Partial<Light>) => {
    const lights = [];
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        lights.push({
          id: i * width + j,
          color: [0, 0, 0],
          selected: false,
          ...defaultProps,
        });
      }
    }
    return lights;
  };

  const [lists, setLists] = useReducer((state, action) => {
    localStorage.setItem('lists', JSON.stringify(state));
    return action;
  }, JSON.parse(localStorage.getItem('lists')) ?? [newList('New List')]);
  // TODO: use a reducer to fade lights between state
  const [lights, setLights] = useState<Light[]>(fillLights());

  return (
    <main>
      <Viewer lights={lights} setLights={setLights} />
      <Editor
        lists={lists}
        setLists={setLists}
        // TODO: create a runner class to control the different controls of an active show
        runList={null}
        lights={lights}
        setLights={setLights}
      />
    </main>
  );
};

render(<App />, document.body);
