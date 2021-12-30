import uuid from 'uuid';
import { defaultMs } from './fade';

export type Color = [number, number, number];

export interface Light {
  id: number;
  color: Color;
  selected: boolean;
}

export interface Cue {
  id: string;
  duration: number;
  name?: string;
  ids: Light['id'][];
  color: Light['color'];
}

export interface CueList {
  id: string;
  name: string;
  cues: Cue[];
  repeat?: boolean;
}

export interface View {
  live: Cue[];
  edit: Cue;
}

export enum KeybindType {
  /** plays a list and **does not** wait after the first cue */
  Play = 0,
  /** finishes the first cue animation and **waits** */
  Pause,
  /** goes to the first cue of the list and **waits** */
  Start,
  /** goes to the next cue and **waits** */
  Next,
  /** goes to the previous cue and **waits** */
  Prev,
  /** deactivates the cue and resets the list to its first cue */
  Release,
  /** shows a the first cue of a list as long as the key is held */
  Flash,
}

export interface Keybind {
  id: string;
  key: KeyboardEvent['key'];
  ids: CueList['id'][];
  type: KeybindType;
  raw: {
    key: KeyboardEvent['key'];
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
  };
}

export const fillLights = (
  height = 8,
  width = 8,
  defaultProps?: Partial<Light>
) => {
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

export const newCue = (): Cue => {
  const id = uuid.v4();
  return {
    id,
    duration: defaultMs,
    ids: [],
    color: [0, 0, 0],
  };
};

export const newList = (name?: string): CueList => {
  const id = uuid.v4();
  return {
    id,
    name: name ?? `New List ${id + 1}`,
    cues: [newCue()],
  };
};

export const newKeybind = (): Keybind => {
  const id = uuid.v4();
  return {
    id,
    key: '',
    ids: [],
    type: KeybindType.Play,
    raw: {
      key: '',
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    },
  };
};

export const asyncTimeout = (fn: Function, ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, ms);
  });
};
