import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';

import { Controls, newControls, newCue, newList, State, View } from './shared';
import type { CueList, Keybind } from './shared';
import { Editor } from './editor';
import { Viewer } from './viewer';
import { KeyEditor } from './keyeditor';
import { Tabs, Tab } from './lib/tabs';

const App = () => {
  const [lists, setLists]: [CueList[], (lists: CueList[]) => void] = useReducer(
    (state, action) => {
      localStorage.setItem('lists', JSON.stringify(action));
      return action;
    },
    JSON.parse(localStorage.getItem('lists')) ?? [newList('New List')]
  );
  const [keybinds, setKeybinds]: [Keybind[], (keybinds: Keybind[]) => void] =
    useReducer((state, action) => {
      localStorage.setItem('keybinds', JSON.stringify(action));
      return action;
    }, JSON.parse(localStorage.getItem('keybinds')) ?? []);

  const [view, setView] = useState<View>({ live: [], edit: newCue() });
  const [controls, setControls]: [Controls, State<Controls>] = useReducer((state, action) => {
    localStorage.setItem('controls', JSON.stringify(action));
    return action;
  }, JSON.parse(localStorage.getItem('controls')) ?? newControls());

  return (
    <main>
      <Viewer view={view} setView={setView} />
      <Tabs>
        <Tab name="Cue(List)Editor">
          <Editor
            lists={lists}
            setLists={setLists}
            runList={null}
            view={view}
            setView={setView}
          />
        </Tab>
        <Tab name="Keybind Editor">
          <KeyEditor
            keybinds={keybinds}
            setKeybinds={setKeybinds}
            lists={lists}
            view={view}
            setView={setView}
          />
        </Tab>
      </Tabs>
    </main>
  );
};

render(<App />, document.body);
