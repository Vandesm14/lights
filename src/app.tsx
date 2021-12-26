import { render } from 'preact';
import { useState } from 'preact/hooks';
import 'preact/debug';

import { newCue, newList } from './shared';
import type { Color, Light, Cue, CueList } from './shared';
import { Editor } from './editor';

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
    if (!!list?.cues) return;
    for (let cue of list.cues) {
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
      <Editor
        lists={lists}
        setLists={setLists}
        runList={runList}
        lights={lights}
        setLights={setLights}
      />
    </main>
  );
}

render(<App />, document.body);
