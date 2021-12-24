import { Component, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import 'preact/debug';
import convert from 'color-convert';

const out = document.getElementById('out');

const useBetterState = <T extends object>(
  initialState: T
): [T, (newState: Partial<T>) => void] => {
  const [state, setState] = useState<T>(initialState);
  const set = (newState: Partial<T>) => setState({ ...state, ...newState });
  return [state, set];
};

type Color = [number, number, number];

interface Light {
  id: number;
  color: Color;
  selected: boolean;
}

interface Cue {
  duration: number;
  name?: string;
  ids: Light['id'][];
  color: Light['color'];
}

interface CueList {
  id: number;
  name: string;
  cues: Cue[];
  repeat?: boolean;
}

enum KeybindType {
  /** plays a list and does not wait after the first cue */
  Play = 0,
  /** goes to the beginning of a list (plays a list and waits after the first cue) */
  Start,
  /** goes to the next cue and waits */
  Next,
  /** goes to the previous cue and waits */
  Prev,
  /** deactivates the cue and resets the list to its first cue */
  Release,
  /** shows a the first cue of a list as long as the key is held */
  Flash,
}

interface Keybind {
  key: KeyboardEvent['key'];
  ids: CueList['id'][];
  type: KeybindType;
}

interface AppState {
  lights: Light[];
}

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

  const [lights, setLights] = useBetterState<Light[]>(fillLights());

  const transform = (payload: Partial<Light> & { id: Light['id'] }) => {
    const light = lights.find((el) => el.id === payload.id);
    let newLight: Light;

    if (light) {
      newLight = { ...light, ...payload };
      lights[lights.findIndex((el) => el.id === newLight.id)] = newLight;
      setLights([...lights]);
    } else {
      throw new Error(
        `Cannot perform transform, light with id: "${payload.id}" not found`
      );
    }
  };

  // TODO: allow custom width & height
  return (
    <main>
      <div className="viewer">
        {lights.map((light) => {
          return (
            <div
              className={`light ${light.selected ? 'selected' : ''}`}
              style={{
                backgroundColor: `rgb(${light.color.join(',')})`,
              }}
            />
          );
        })}
      </div>
      {/* <button onClick={() => testPattern.call(this)}>Test Pattern</button> */}
    </main>
  );
};

const Editor = () => {
  const [lists, setLists] = useState<CueList[]>([]);
  const [selectedList, setSelectedList] = useState(0);

  const addList = () => {
    lists.push({
      id: lists.length,
      name: `New List ${lists.length + 1}`,
      cues: [],
    });
    setLists([...lists]);
    setSelectedList(lists.length - 1);
  };

  const selectList = (e: Event) => {
    const selectedList = parseInt((e.target as HTMLInputElement).value);
    setSelectedList(selectedList);
  };

  return (
    <div className="editor">
      <div className="controls">
        <button onClick={() => addList()}>Add List</button>
        <select
          name="selectedList"
          onChange={(e) => selectList(e)}
          value={selectedList}
        >
          {lists.map((list) => (
            <option value={list.id}>{list.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

render(<Editor />, document.body);
