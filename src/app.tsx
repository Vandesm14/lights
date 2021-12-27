import { render } from 'preact';
import { useState, useReducer } from 'preact/hooks';
import 'preact/debug';

import { newList } from './shared';
import type { Color, Light, Cue, CueList } from './shared';
import { Editor } from './editor';
import { Viewer } from './viewer';

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

  const [lists, setLists] = useReducer(
    (state, action) => {
      console.log({state, action});
      localStorage.setItem('lists', JSON.stringify(state));
      return action;
    },
    JSON.parse(localStorage.getItem('lists')) ?? [newList(0)]
  );
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
