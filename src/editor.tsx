import { useContext, useEffect, useRef, useState } from 'preact/hooks';

import { newCue, newList } from './shared';
import type { Cue, CueList } from './shared';
import { CueItem } from './lib/cueitem';
import convert from 'color-convert';

import { Context } from './store';

declare const JSColor: any;

export const Editor = () => {
  const input = useRef(null);
  const { lists, setLists, view, setView } = useContext(Context);

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

  const selectList = (e) => {
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

  useEffect(() => {
    const palette = [
      '#000000',
      '#ffffff',
      '#ff0000',
      '#ffa500',
      '#ffff00',
      '#00ff00',
      '#00ffff',
      '#0000ff',
      '#ff00ff',
    ];

    if (!input.current.jscolor) {
      new JSColor(input.current, {
        value: convert.rgb.hex(getCue().color),
        palette,
      });
    } else {
      input.current.jscolor.fromRGB(...getCue().color);
      input.current.jscolor.palette = palette;
    }
  }, [lists, selectedList, selectedCue]);

  const setCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    const ids = view.edit.ids;
    editCueData(getCue().id)({ ...cue, ids });
    viewCueLights(id);
  };

  const viewCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    if (selectedCue !== id) setSelectedCue(cue.id);
    setView({ ...view, edit: cue });
  };

  const handleColorChange = (raw: string) => {
    editCueData(getCue().id)({ color: convert.hex.rgb(raw) });
    setCueLights(getCue().id);
  };

  return (
    <div className="editor">
      <h1>Cuelists</h1>
      <div className="controls">
        <div className="hstack">
          <select
            name="selectedList"
            onChange={selectList}
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
          <button onClick={() => removeList(selectedList)}>Remove List</button>
        </div>
        <div className="hstack">
          <input
            type="text"
            value={getList().name}
            onInput={(e) =>
              setLists(
                lists.map((list) =>
                  list.id === selectedList
                    ? { ...list, name: (e.target as HTMLInputElement).value }
                    : list
                )
              )
            }
          />
        </div>
        <div className="hstack">
          <input
            ref={input}
            className="jscolor"
            value={'#' + convert.rgb.hex(getCue()?.color) || '#000000'}
            onInput={(e) =>
              handleColorChange((e.target as HTMLInputElement).value)
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
            <th>Duration</th>
            <th>Color</th>
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
                selectedCue={selectedCue}
                setSelectedCue={setSelectedCue}
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
