import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';
import convert from 'color-convert';
import { HexColorPicker } from 'react-colorful';

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

const Viewer = () => {
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
  );
};

const Editor = () => {
  const newCue = (id: number): Cue => {
    return {
      id,
      duration: 0,
      ids: [],
      color: [0, 0, 0],
    };
  };

  const newList = (id: number, name?: string): CueList => {
    return {
      id: id,
      name: name ?? `New List ${id + 1}`,
      cues: [newCue(0)],
    };
  };

  const [lists, setLists] = useState<CueList[]>([newList(0)]);
  const [selectedList, setSelectedList] = useState(0);

  const addList = (name?: string) => {
    setSelectedList(lists.length);
    setLists([...lists, newList(lists.length, name)]);
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

  const addCue = () => {
    const list = getList(selectedList);
    console.log('addCue', list);
    if (!list) return;
    const newLists = [...lists];
    newLists
      .find((list) => list.id === selectedList)!
      .cues.push(newCue(list.cues.length));
    setLists(newLists);
  };

  const removeCue = (id: Cue['id']) => {
    const list = getList(selectedList);
    if (!list) return;
    const newLists = [...lists];
    newLists.find((list) => list.id === selectedList)!.cues = list.cues.filter(
      (cue) => cue.id !== id
    );
    setLists(newLists);
  };

  const moveCue = (id: Cue['id'], direction: 'up' | 'down') => {
    const list = getList(selectedList);
    if (!list) return;
    const newLists = [...lists];
    const cueIndex = list.cues.findIndex((cue) => cue.id === id);
    if (cueIndex === -1) return;
    const newCues = [...list.cues];
    if (direction === 'up') {
      if (cueIndex === 0) return;
      const temp = newCues[cueIndex - 1];
      newCues[cueIndex - 1] = newCues[cueIndex];
      newCues[cueIndex] = temp;
    } else {
      if (cueIndex === newCues.length - 1) return;
      const temp = newCues[cueIndex + 1];
      newCues[cueIndex + 1] = newCues[cueIndex];
      newCues[cueIndex] = temp;
    }
    newLists.find((list) => list.id === selectedList)!.cues = newCues;
    setLists(newLists);
  };

  const editCueData = (id: number) => {
    const index = lists[selectedList].cues.findIndex((cue) => cue.id === id);
    return (data: Partial<Cue>) => {
      const newLists = [...lists];
      newLists[selectedList].cues[index] = {
        ...lists[selectedList].cues[index],
        ...data,
      };
      setLists(newLists);
    };
  };

  const CueItem = ({
    cue,
    index,
    editCueData,
    removeCue,
  }: {
    cue: Cue;
    index: number;
    editCueData: (data: Partial<Cue>) => void;
    removeCue: () => void;
  }) => {
    const handleNameChange = (e: Event) => {
      editCueData({ name: (e.target as HTMLInputElement).value });
    };

    const handleDurationChange = (e: Event) => {
      editCueData({ duration: parseInt((e.target as HTMLInputElement).value) });
    };

    const handleColorChange = (raw: string) => {
      const color = convert.hex.rgb(raw);
      editCueData({ color });
    };

    return (
      <tr>
        <td class="index">
          {index}
        </td>
        <td>
          <input type="text" value={cue.name} onChange={handleNameChange} />
        </td>
        <td>
          <input
            type="number"
            value={cue.duration}
            onChange={handleDurationChange}
          />
        </td>
        <td>
          <input type="color" onChange={(e) => handleColorChange(e.target.value)} />
        </td>
        <td class="edit">
          <div className="hstack">
            <button onClick={() => removeCue()}>Remove</button>
            <button onClick={() => moveCue(cue.id, 'up')}>Up</button>
            <button onClick={() => moveCue(cue.id, 'down')}>Down</button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="editor">
      <h1>Cuelists</h1>
      <div className="controls">
        <div className="hstack">
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
              lists.map((list, index) => (
                <option
                  value={list.id}
                  selected={index === selectedList ? true : null}
                >
                  {list.name}
                </option>
              ))
            )}
          </select>
          <button onClick={() => addList()}>Add List</button>
          {/* FIXME: Remove List doesn't properly set selectedList */}
          <button onClick={() => removeList(selectedList)}>Remove List</button>
        </div>
      </div>
      <h1>Cues</h1>
      <div className="controls">
        <div className="hstack">
          <button onClick={() => addCue()}>Add Cue</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Duration</th>
            <th>Color</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {getList(selectedList)?.cues?.map((cue, index) => (
            <CueItem
              cue={cue}
              index={index}
              editCueData={editCueData(cue.id)}
              removeCue={() => removeCue(cue.id)}
            />
          )) ?? (
            <tr>
              <td colSpan={5}>No cues</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

function App() {
  const [lists, setLists] = useState<CueList[]>([]);
  const [lights, setLights] = useState<Light[]>([]);

  return (
    <main>
      <Viewer lists={lists} lights={lights} />
      <Editor lists={lists} setLists={setLists} setLights={setLights} />
    </main>
  );
}

render(<Editor />, document.body);
