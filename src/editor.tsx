import { useState, useEffect } from 'preact/hooks';
import convert from 'color-convert';

import { newCue, newList } from './shared';
import type { Color, Light, Cue, CueList } from './shared';

const CueItem = ({
  cue,
  index,
  lists,
  setLists,
  lights,
  setLights,
  lib: { getList, editCueData, removeCue, moveCue },
}) => {
  const setCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    const ids = lights
      .filter((light) => light.selected)
      .map((light) => light.id);
    console.log('setCueLights', ids);
    editCueData({ ...cue, ids });
    viewCueLights(id);
  };

  const viewCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    setLights(
      lights.map((light) => {
        if (cue.ids.includes(light.id)) {
          return { ...light, color: cue.color, selected: true };
        } else {
          return { ...light, color: [0, 0, 0], selected: false };
        }
      })
    );
  };

  const handleNameChange = (e: Event) => {
    editCueData({ name: (e.target as HTMLInputElement).value });
  };

  const handleDurationChange = (e: Event) => {
    editCueData({ duration: parseInt((e.target as HTMLInputElement).value) });
  };

  const handleColorChange = (raw: string) => {
    editCueData({ color: convert.hex.rgb(raw) });
    setCueLights(cue.id);
  };

  return (
    <tr>
      <td class="index">{index}</td>
      <td>{cue.ids.length}</td>
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

export const Editor = ({ lists, setLists, runList, lights, setLights }) => {
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
    console.log('moveCue', id, direction, list);
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
            <th>Count</th>
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
              lists={lists}
              setLists={setLists}
              lights={lights}
              setLights={setLights}
              lib={{ getList, editCueData: editCueData(cue.id), removeCue, moveCue }}
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