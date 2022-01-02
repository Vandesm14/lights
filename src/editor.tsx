import { useContext, useState } from 'preact/hooks';

import { newCue, newList } from './shared';
import type { Cue, CueList } from './shared';
import { CueItem } from './lib/cueitem';

import { Context } from './store';

export const Editor = () => {
  const { lists, setLists } = useContext(Context);

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
          {/* <button>Run List</button> */}
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
