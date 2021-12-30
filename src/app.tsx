import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';

import { Cue, KeybindType, newList, View } from './shared';
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
  const [lights, setLights] = useState<Light[]>(fillLights());
  const [keybinds, setKeybinds]: [Keybind[], (keybinds: Keybind[]) => void] =
    useReducer((state, action) => {
      localStorage.setItem('keybinds', JSON.stringify(action));
      return action;
    }, JSON.parse(localStorage.getItem('keybinds')) ?? []);

  const [view, setView] = useState<View>({ live: [], edit: [] });

  return (
    <main>
      <Viewer lights={lights} setLights={setLights} view={view} />
      <div className="split2">
        <Editor
          lists={lists}
          setLists={setLists}
          runList={null}
          lights={lights}
          setLights={setLights}
          view={view}
          setView={setView}
        />
        <KeyEditor
          keybinds={keybinds}
          setKeybinds={setKeybinds}
          lists={lists}
          view={view}
          setView={setView}
        />
      </div>
    </main>
  );
};

render(<App />, document.body);
