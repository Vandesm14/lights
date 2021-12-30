import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';

import { newCue, newList, View } from './shared';
import type { CueList, Keybind } from './shared';
import { Editor } from './editor';
import { Viewer } from './viewer';
import { KeyEditor } from './keyeditor';

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

  return (
    <main>
      <Viewer view={view} setView={setView} />
      <div className="split2">
        <Editor
          lists={lists}
          setLists={setLists}
          runList={null}
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
