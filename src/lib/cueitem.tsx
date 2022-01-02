import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import convert from 'color-convert';

import { defaultMs } from './fade';
import { Cue, CueList } from '../shared';

import { Context } from '../store';

export interface CueItemProps {
  key: Cue['id'];
  cue: Cue;
  index: number;
  selectedCue: Cue['id'];
  setSelectedCue: (id: Cue['id']) => void;
  selectedList: CueList['id'];
  lib: {
    getList: (id?: CueList['id']) => CueList;
    editCueData: (data: Partial<Cue>) => void;
    removeCue: (id: Cue['id']) => void;
  };
}

declare const JSColor: any;

export const CueItem = ({
  cue,
  index,
  selectedCue,
  setSelectedCue,
  selectedList,
  lib: { getList, editCueData, removeCue },
}: CueItemProps) => {
  const input = useRef(null);
  const { lists, setLists, view, setView } = useContext(Context);
  const [display, setDisplay] = useState(false);

  const setCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    const ids = view.edit.ids;
    editCueData({ ...cue, ids });
    viewCueLights(id);
  };

  const viewCueLights = (id: Cue['id']) => {
    const cue = getList().cues.find((cue) => cue.id === id);
    if (!cue) return;
    if (selectedCue !== id) setSelectedCue(cue.id);
    setView({ ...view, edit: cue });
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

  useEffect(() => {
    viewCueLights(getList()?.cues[0]?.id);
  }, [selectedList]);

  useEffect(() => {
    viewCueLights(selectedCue);
  }, [selectedCue]);

  useEffect(() => {
    if (!input.current.jscolor) {
      new JSColor(input.current, {
        value: convert.rgb.hex(cue.color),
        palette: [
          '#000000',
          '#ffffff',
          '#ff0000',
          '#ffa500',
          '#ffff00',
          '#00ff00',
          '#00ffff',
          '#0000ff',
          '#ff00ff',
        ],
      });
    } else {
      input.current.jscolor.fromRGB(cue.color);
    }
  }, [input]);

  return (
    <>
      <tr
        className={selectedCue === cue.id ? 'selected' : ''}
        onClick={() => viewCueLights(cue.id)}
      >
        <td className="index">{index}</td>
        <td className="index">{cue.ids.length}</td>
        <td>
          <div className="hstack">
            <button onClick={() => viewCueLights(cue.id)}>View</button>
            <button onClick={() => setCueLights(cue.id)}>Store</button>
          </div>
        </td>
        <td>
          <div className="hstack">
            <input
              type="number"
              value={cue.duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              min="0"
              step="1"
            />
            <button onClick={() => handleDurationChange(defaultMs.toString())}>
              Default
            </button>
          </div>
        </td>
        <td>
          <input
            ref={input}
            className="jscolor"
            value={'#' + convert.rgb.hex(cue.color)}
            onInput={(e) =>
              handleColorChange((e.target as HTMLInputElement).value)
            }
          />
        </td>
        <td>
          <div className="hstack">
            <button onClick={() => moveCue(cue.id, 'up')}>▲</button>
            <button onClick={() => moveCue(cue.id, 'down')}>▼</button>
            <button onClick={() => removeCue(cue.id)}>X</button>
          </div>
        </td>
      </tr>
      <tr style={{ display: display ? 'table-row' : 'none' }}>
      </tr>
    </>
  );
};
