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

type Action<T> = (action: T) => void;

interface Store {
  lists: CueList[];
  setLists: (lists: CueList[]) => void;
  keybinds: Keybind[];
  setKeybinds: (keybinds: Keybind[]) => void;
  view: View;
  setView: (view: View) => void;
  controls: Controls;
  setControls: Action<Controls>;
  options: Options;
  setOptions: Action<Options>;
}
export const Context = createContext({} as Store);

export const Store: FunctionalComponent = ({ children }) => {
  const [lists, setLists] = useReducer<CueList[], CueList[]>(
    (state, action) => {
      localStorage.setItem('lists', JSON.stringify(action));
      return action;
    },
    JSON.parse(localStorage.getItem('lists')) ?? [newList('New List')]
  );

  const [keybinds, setKeybinds] = useReducer<Keybind[], Keybind[]>(
    (state, action) => {
      localStorage.setItem(
        'keybinds',
        JSON.stringify(action.map((k) => ({ ...k, active: false })))
      );
      return action;
    },
    JSON.parse(localStorage.getItem('keybinds')) ?? []
  );

  const [view, setView] = useState<View>({ live: [], edit: newCue() });

  const [controls, setControls] = useReducer<Controls, Controls>(
    (state, action) => {
      localStorage.setItem('controls', JSON.stringify(action));
      return action;
    },
    JSON.parse(localStorage.getItem('controls')) ?? newControls()
  );

  const [options, setOptions] = useReducer<Options, Options>(
    (state, action) => {
      localStorage.setItem('options', JSON.stringify(action));
      return action;
    },
    JSON.parse(localStorage.getItem('options')) ?? {}
  );

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

  return (
    <Context.Provider value={construct} children={children}></Context.Provider>
  );
};
