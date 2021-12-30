import { useState, useEffect } from 'preact/hooks';
import convert from 'color-convert';

import { newCue, newList, View } from './shared';
import type { Cue, CueList, Light } from './shared';
import { defaultMs } from './fade';

interface CueItemProps {
  key: Cue['id'];
  cue: Cue;
  index: number;
  lists: CueList[];
  setLists: (lists: CueList[]) => void;
  selectedCue: Cue['id'];
  setSelectedCue: (id: Cue['id']) => void;
  lights: Light[];
  setLights: (lights: Light[]) => void;
  view: View;
  setView: (view: View) => void;
  selectedList: CueList['id'];
  lib: {
    getList: (id?: CueList['id']) => CueList;
    editCueData: (data: Partial<Cue>) => void;
    removeCue: (id: Cue['id']) => void;
  };
}

const CueItem = ({
  key,
  cue,
  index,
  lists,
  setLists,
  selectedCue,
  setSelectedCue,
  lights,
  setLights,
  view,
  setView,
  selectedList,
  lib: { getList, editCueData, removeCue },
}: CueItemProps) => {
  const setCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    const ids = lights
      .filter((light) => light.selected)
      .map((light) => light.id);
    editCueData({ ...cue, ids });
    viewCueLights(id);
  };

  const viewCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    if (selectedCue !== id) setSelectedCue(cue.id);
    setView({ ...view, edit: [cue] })
  };

  const handleNameChange = (e: Event) => {
    editCueData({ name: (e.target as HTMLInputElement).value });
  };

  const handleDurationChange = (e: Event) => {
    let value = parseInt((e.target as HTMLInputElement).value);
    if (isNaN(value)) value = defaultMs;
    editCueData({ duration: value });
  };

  const handleColorChange = (raw: string) => {
    editCueData({ color: convert.hex.rgb(raw) });
    setCueLights(cue.id);
  };

  const moveCue = (id: Cue['id'], direction: 'up' | 'down') => {
    const list = getList();
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

  // when the list is changed, view the first cue
  useEffect(() => {
    viewCueLights(getList()?.cues[0]?.id);
  }, [selectedList]);

  useEffect(() => {
    viewCueLights(selectedCue);
  }, [selectedCue]);

  return (
    <tr
      class={selectedCue === cue.id ? 'selected' : ''}
      onClick={() => viewCueLights(cue.id)}
    >
      <td class="index">{index}</td>
      <td class="index">{cue.ids.length}</td>
      <td>
        <div className="hstack">
          <button onClick={() => viewCueLights(cue.id)}>View</button>
          <button onClick={() => setCueLights(cue.id)}>Store</button>
        </div>
      </td>
      {/* <td>
        <input type="text" value={cue.name} onChange={handleNameChange} />
      </td> */}
      <td>
        <input
          type="number"
          value={cue.duration}
          onChange={handleDurationChange}
          min="0"
          step="1"
        />
      </td>
      <td>
        <input
          type="color"
          value={'#' + convert.rgb.hex(cue.color)}
          onInput={(e) => handleColorChange(e.target.value)}
        />
      </td>
      <td>
        <div className="hstack">
          <button onClick={() => removeCue(cue.id)}>Remove</button>
          <button onClick={() => moveCue(cue.id, 'up')}>Up</button>
          <button onClick={() => moveCue(cue.id, 'down')}>Down</button>
        </div>
      </td>
    </tr>
  );
};

interface EditorProps {
  lists: CueList[];
  setLists: (lists: CueList[]) => void;
  // TODO: when runner is done, update this type
  runList: any;
  lights: Light[];
  setLights: (lights: Light[]) => void;
  view: View;
  setView: (view: View) => void;
}

export const Editor = ({
  lists,
  setLists,
  runList,
  lights,
  setLights,
  view,
  setView,
}: EditorProps) => {
  const [selectedList, setSelectedList] = useState(lists[0].id);
  const [selectedCue, setSelectedCue] = useState(lists[0].cues[0].id);

  const getList = (id = selectedList): CueList | undefined =>
    lists.find((list) => list.id === id);
  const getListIndex = (id = selectedList): number =>
    lists.findIndex((list) => list.id === id);

  const getCue = (id = selectedCue): Cue | undefined =>
    getList()?.cues.find((cue) => cue.id === id);
  const getCueIndex = (id = selectedCue): number =>
    getList()?.cues.findIndex((cue) => cue.id === id);

  const addList = (name?: string) => {
    const list = newList(name || `New List ${lists.length + 1}`);
    setLists([...lists, list]);
    setSelectedList(list.id);
  };

  const removeList = (id: CueList['id']) => {
    if (lists.length <= 1) return;
    setLists(lists.filter((list) => list.id !== id));
    if (selectedList === id && lists.length > 0) {
      const index = lists[getListIndex(id) - 1]?.id;
      setSelectedList(index || lists[0].id);
    }
  };

  const selectList = (e: Event) => {
    const selectedList = (e.target as HTMLInputElement).value;
    setSelectedList(selectedList);
  };

  const addCue = () => {
    const list = getList();
    if (!list) return;
    const newLists = [...lists];
    newLists.find((list) => list.id === selectedList)!.cues.push(newCue());
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

  const editCueData = (id: Cue['id']) => {
    const index = getCueIndex(id);
    return (data: Partial<Cue>) => {
      const newLists = [...lists];
      newLists[getListIndex()].cues[index] = {
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
              lists.map((list) => (
                <option
                  value={list.id}
                  selected={list.id === selectedList ? true : null}
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
        <div className="hstack">
          <input
            type="text"
            value={getList().name}
            onInput={(e) =>
              setLists(
                lists.map((list) =>
                  list.id === selectedList
                    ? { ...list, name: e.target.value }
                    : list
                )
              )
            }
          />
        </div>
      </div>
      <h1>Cues</h1>
      <div className="controls">
        <div className="hstack">
          <button onClick={() => addCue()}>Add Cue</button>
          <button
            onClick={() =>
              setSelectedCue(
                getList().cues[getCueIndex() - 1 < 0 ? 0 : getCueIndex() - 1].id
              )
            }
          >
            Prev
          </button>
          <button
            onClick={() =>
              setSelectedCue(
                getList().cues[
                  getCueIndex() + 1 > getList().cues.length - 1
                    ? 0
                    : getCueIndex() + 1
                ].id
              )
            }
          >
            Next
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Count</th>
            <th>Cue</th>
            {/* <th>Name</th> */}
            <th>Duration</th>
            <th>Color</th>
            {/* <th>Type</th> */}
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {getList()?.cues?.length > 0 ? (
            getList()?.cues?.map((cue, index) => (
              <CueItem
                key={cue.id}
                cue={cue}
                index={index}
                lists={lists}
                setLists={setLists}
                selectedCue={selectedCue}
                setSelectedCue={setSelectedCue}
                lights={lights}
                setLights={setLights}
                view={view}
                setView={setView}
                selectedList={selectedList}
                lib={{
                  getList,
                  editCueData: editCueData(cue.id),
                  removeCue,
                }}
              />
            ))
          ) : (
            <tr>
              <td colSpan={20}>No cues</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
