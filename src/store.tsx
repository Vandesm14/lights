import { createContext, FunctionalComponent } from 'preact';
import { StateUpdater, useReducer, useState } from 'preact/hooks';
import {
  CueList,
  Keybind,
  View,
  Controls,
  Options,
  newList,
  newCue,
  newControls,
} from './shared';

interface Store {
  lists: CueList[];
  setLists: (lists: CueList[]) => void;
  keybinds: Keybind[];
  setKeybinds: (keybinds: Keybind[]) => void;
  view: View;
  setView: (view: View) => void;
  controls: Controls;
  setControls: StateUpdater<Controls>;
  options: Options;
  setOptions: StateUpdater<Options>;
}
export const Context = createContext({} as Store);

export const Store: FunctionalComponent = ({ children }) => {
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
  const [controls, setControls]: [Controls, StateUpdater<Controls>] =
    useReducer((state, action) => {
      localStorage.setItem('controls', JSON.stringify(action));
      return action;
    }, JSON.parse(localStorage.getItem('controls')) ?? newControls());
  const [options, setOptions] = useReducer((state, action) => {
    localStorage.setItem('options', JSON.stringify(action));
    return action;
  }, JSON.parse(localStorage.getItem('options')) ?? {});

  const construct: Store = {
    lists,
    setLists,
    keybinds,
    setKeybinds,
    view,
    setView,
    controls,
    setControls,
    options,
    setOptions,
  };

  return <Context.Provider value={construct} children={children}></Context.Provider>;
};
