import uuid from 'uuid';

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
}

export const newCue = (): Cue => {
  const id = uuid.v4();
  return {
    id,
    duration: 0,
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
