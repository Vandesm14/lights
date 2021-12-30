import { useEffect } from 'preact/hooks';
import convert from 'color-convert';

import { defaultMs } from '../fade';
import { Cue, CueList, Light, View } from '../shared';

export interface CueItemProps {
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

export const CueItem = ({
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
    setView({ ...view, edit: [cue] });
  };

  const handleNameChange = (e: Event) => {
    editCueData({ name: (e.target as HTMLInputElement).value });
  };

  const handleDurationChange = (val: string) => {
    let value = parseInt(val);
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
        <div className="hstack">
          <input
            type="number"
            value={cue.duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            min="0"
            step="1"
          />
          <button onClick={() => handleDurationChange(defaultMs.toString())}>Default</button>
        </div>
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
