import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';
import convert from 'color-convert';
import { HexColorPicker } from 'react-colorful';

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

const Viewer = ({ lights, setLights }) => {
  const handleSelect = (id: Light['id']) => {
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: !light.selected };
        }
        return light;
      })
    );
  };

  const selectNone = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setLights(lights.map((light) => ({ ...light, selected: false })));
    }
  };

  return (
    <div className="viewer" onClick={selectNone}>
      <div className="grid">
        {lights.map((light) => {
          return (
            <div
              className={`light ${light.selected ? 'selected' : ''}`}
              style={{
                backgroundColor: `rgb(${light.color.join(',')})`,
              }}
              onClick={() => handleSelect(light.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

const Editor = ({ lists, setLists, runList, lights, setLights }) => {
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

  const getList = (id = selectedList) => lists.find((list) => list.id === id);

  const addCue = () => {
    const list = getList();
    if (!list) return;
    const newLists = [...lists];
    newLists
      .find((list) => list.id === selectedList)!
      .cues.push(newCue(list.cues.length));
    setLists(newLists);
  };

  const removeCue = (id: Cue['id']) => {
    const list = getList();
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
    const index = getList().cues.findIndex((cue) => cue.id === id);
    return (data: Partial<Cue>) => {
      const newLists = [...lists];
      newLists[selectedList].cues[index] = {
        ...getList().cues[index],
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
    const setCueLights = (id: Cue['id']) => {
      const cue = getList().cues.find((cue) => cue.id === id);
      if (!cue) return;
      // set the cue ids to the selected lights using editCueData
      const ids = lights.filter((light) => light.selected).map((light) => light.id);
      editCueData({ ids: ids });
    };

    const viewCueLights = (id: Cue['id']) => {
      const cue = getList().cues.find((cue) => cue.id === id);
      if (!cue) return;
      // set all of the lights to black and then set the selected lights to the cue's color and set them to be "selected"
      setLights(lights.map((light) => {
        if (cue.ids.includes(light.id)) {
          return { ...light, color: cue.color, selected: true };
        } else {
          return { ...light, color: [0, 0, 0], selected: false };
        }
      }));
    };

    const handleNameChange = (e: Event) => {
      editCueData({ name: (e.target as HTMLInputElement).value });
    };

    const handleDurationChange = (e: Event) => {
      editCueData({ duration: parseInt((e.target as HTMLInputElement).value) });
    };

    const handleColorChange = (raw: string) => {
      editCueData({ color: convert.hex.rgb(raw) });
      viewCueLights(cue.id);
    };

    return (
      <tr>
        <td class="index">{index}</td>
        <td>
          <div className="hstack">
            <button onClick={() => viewCueLights(cue.id)}>View</button>
            <button onClick={() => setCueLights(cue.id)}>Store</button>
          </div>
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
          <input
            type="color"
            onChange={(e) => handleColorChange(e.target.value)}
          />
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
          <button onClick={() => runList(selectedList)}>Run List</button>
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

  const [lists, setLists] = useState<CueList[]>([newList(0)]);
  const [lights, setLights] = useState<Light[]>(fillLights());

  const asyncTimeout = (fn: Function, ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        fn();
        resolve();
      }, ms);
    });
  };

  const runList = async (list: CueList) => {
    const fade = async (from: Light[], to: Light[], ms: number) => {
      const steps = ms / 10;
      const stepSize = 1 / steps;
      for (let i = 0; i < steps; i++) {
        const newLights = from.map((light, index) => ({
          ...light,
          color: [
            Math.round(
              light.color[0] + (to[index].color[0] - light.color[0]) * stepSize
            ),
            Math.round(
              light.color[1] + (to[index].color[1] - light.color[1]) * stepSize
            ),
            Math.round(
              light.color[2] + (to[index].color[2] - light.color[2]) * stepSize
            ),
          ] as Color,
        }));
        setLights(newLights);
        await asyncTimeout(() => {}, 10);
      }
    };
    for (let cue of list.cues) {
      // the fade the lights from the previous state to the new state over the duration (ms)
      await fade(
        lights,
        lights.filter((light) => cue.ids.includes(light.id)),
        cue.duration
      );
    }
    if (list.repeat) {
      runList(list);
    }
  };

  return (
    <main>
      <Viewer lights={lights} setLights={setLights} />
      <Editor lists={lists} setLists={setLists} runList={runList} lights={lights} setLights={setLights} />
    </main>
  );
}

render(<App />, document.body);
