import { Cue, CueList, Light, asyncTimeout } from "./shared";
import type { Color } from "./shared";

interface Runner {
  lights: Light[];
  prevState: Light[];
  list: CueList;
  index: number;
  cues: Cue[];
  running: boolean;
  defaultMs: number;
}

class Runner {
  constructor(list: CueList, lights: Light[], defaultMs = 100) {
    this.lights = lights;
    this.prevState = lights;
    this.list = list;
    this.index = 0;
    this.cues = list.cues;
    this.running = false;
    this.defaultMs = defaultMs;
  }

  /** fades the lights from the previous state to the current state */
  private async tick() {
    const fade = async (from: Light[], to: Light[], ms = this.defaultMs) => {
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
        this.lights = newLights;
        await asyncTimeout(() => {}, 10);
      }
    };
  }
  private run() {
    if (!this.running) return;
  }
  private blackout() {
    this.lights.forEach((light) => {
      light.color = [0, 0, 0];
    });
  }

  /** plays a list and **does not** wait after the first cue */
  async play() {
    this.run();
    this.running = true;
  }

  /** finishes the first cue animation and **waits** */
  async pause() {
    this.running = false;
  }

  /** goes to the first cue of the list and **waits** */
  async start() {
    this.index = 0;
    await this.tick();
    this.running = false;
  }

  /** goes to the next cue and **waits** */
  async next() {
    this.index = this.index + 1 < this.cues.length ? this.index + 1 : 0;
    await this.tick();
    this.running = false;
  }

  /** goes to the previous cue and **waits** */
  async prev() {
    this.index = this.index - 1 >= 0 ? this.index - 1 : this.cues.length - 1;
    await this.tick();
    this.running = false;
  }

  /** deactivates the cue and resets the list to its first cue */
  async release() {
    this.index = 0;
    await this.tick();
    await this.blackout();
    this.running = false;
  }

  /** shows a the first cue of a list as long as the key is held */
  flash() {
    this.running = true;
    this.run();
  }
}