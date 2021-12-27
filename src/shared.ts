export type Color = [number, number, number];

export interface Light {
  id: number;
  color: Color;
  selected: boolean;
}

export interface Cue {
  id: number;
  duration: number;
  name?: string;
  ids: Light['id'][];
  color: Light['color'];
}

export interface CueList {
  id: number;
  name: string;
  cues: Cue[];
  repeat?: boolean;
}

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

export const newCue = (id: number): Cue => {
  return {
    id,
    duration: 0,
    ids: [],
    color: [0, 0, 0],
  };
};

export const newList = (id: number, name?: string): CueList => {
  return {
    id: id,
    name: name ?? `New List ${id + 1}`,
    cues: [newCue(0)],
  };
};
