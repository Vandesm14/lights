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
  id: number;
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

  const addList = (name?: string) => {
    setSelectedList(lists.length);
    setLists([
      ...lists,
      {
        id: lists.length,
        name: name ?? `New List ${lists.length + 1}`,
        cues: [{
          id: 0,
          duration: 0,
          ids: [],
          color: [0, 0, 0],
        }],
      },
    ]);
  };

  const removeList = (id: CueList['id']) => {
    if (lists.length === 0) return;
    setLists(lists.filter((list) => list.id !== id));
    if (selectedList === id && lists.length > 0) {
      const index = lists[lists.findIndex((list) => list.id === id) - 1]?.id;
      setSelectedList(index > 0 ? index : 0);
    }
  };

  const selectList = (e: Event) => {
    const selectedList = parseInt((e.target as HTMLInputElement).value);
    setSelectedList(selectedList);
  };

  const getList = (id: CueList['id']) => lists.find((list) => list.id === id);

  const editCueData = (index: number, key: string, value) => {
    const newLists = [...lists];
    newLists[selectedList].cues[index][key] = value;
    setLists(newLists);
  }

  return (
    <div className="editor">
      <h1>Cuelists</h1>
      <div className="controls">
        <button onClick={() => addList()}>Add List</button>
        {/* FIXME: Remove List doesn't properly set selectedList */}
        <button onClick={() => removeList(selectedList)}>Remove List</button>
        <select
          name="selectedList"
          onChange={(e) => selectList(e)}
          value={selectedList}
        >
          {lists.length === 0 ? (
            <option value="0" disabled>
              No Lists
            </option>
          ) : (
            lists.map((list, index) => <option value={list.id} selected={index === selectedList ? true : null}>{list.name}</option>)
          )}
        </select>
      </div>
      <h1>Cues</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Duration</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          {getList(selectedList)?.cues?.map((cue, index) => (
            <tr key={cue}>
              <td>
                <input
                  type="text"
                  value={cue.name}
                  onChange={(e) => editCueData(index, 'name', (e.target as HTMLInputElement).value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={cue.duration}
                  onChange={(e) => editCueData(index, 'duration', (e.target as HTMLInputElement).value)}
                />
              </td>
              <td>
                <input
                  type="color"
                  value={`rgb(${cue.color.join(',')})`}
                  onChange={(e) => editCueData(index, 'color', convert.hex.rgb((e.target as HTMLInputElement).value))}
                />
              </td>
            </tr>
          )) ?? (
            <tr>
              <td colSpan={3}>No cues</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

render(<Editor />, document.body);
