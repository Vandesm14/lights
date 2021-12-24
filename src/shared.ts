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