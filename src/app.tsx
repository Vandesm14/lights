import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';

import { KeybindType, newList } from './shared';
import type { CueList, Light, Keybind } from './shared';
import { Editor } from './editor';
import { Viewer } from './viewer';
import { KeyEditor } from './keyeditor';

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

  const [lists, setLists]: [CueList[], (lists: CueList[]) => void] = useReducer(
    (state, action) => {
      localStorage.setItem('lists', JSON.stringify(action));
      return action;
    },
    JSON.parse(localStorage.getItem('lists')) ?? [newList('New List')]
  );
  // TODO: use a reducer to fade lights between state
  const [lights, setLights] = useState<Light[]>(fillLights());

  const [keybinds, setKeybinds]: [Keybind[], (keybinds: Keybind[]) => void] =
    useReducer((state, action) => {
      localStorage.setItem('keybinds', JSON.stringify(action));
      return action;
    }, JSON.parse(localStorage.getItem('keybinds')) ?? []);

  return (
    <main>
      <Viewer lights={lights} setLights={setLights} />
      <div className="split2">
        <Editor
          lists={lists}
          setLists={setLists}
          // TODO: create a runner class to control the different controls of an active show
          runList={null}
          lights={lights}
          setLights={setLights}
        />
        <KeyEditor
          keybinds={keybinds}
          setKeybinds={setKeybinds}
          lists={lists}
        />
      </div>
    </main>
  );
};

render(<App />, document.body);
