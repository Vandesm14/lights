import { asyncTimeout, Color, Light } from '../shared';

export const defaultMs = 100;

const curves = {
  linear: (from, to, t) => from + (to - from) * t,
  easeIn: (from, to, t) => from + (to - from) * t * t,
  easeOut: (from, to, t) => from + (to - from) * (1 - t) * (1 - t),
  easeInOut: (from, to, t) => from + (to - from) * ((t < 0.5) ? t * t * 2 : 1 - (1 - t) * (1 - t) * 2),
};

const frameSize = 1 / 30;

interface FaderProps {
  from?: Light[];
  to: Light[];
}

export const Fader = function (
  lights: Light[],
  setLights: (lights: Light[]) => void
) {
  this.runID = 0;
  return async (props: FaderProps, ms = defaultMs, curve: keyof typeof curves = 'linear') => {
    const { from = lights, to } = props;
    this.runID++;
    let current = this.runID;
    if (ms === 0) {
      setLights(to);
      return;
    }
    const steps = ms / 10;
    const stepSize = 1 / steps;
    for (let i = 0; i < steps; i++) {
      if (this.runID !== current) return;
      const newLights = from.map((light, index) => ({
        ...light,
        color: [
          Math.round(
            curves[curve](light.color[0], to[index].color[0], stepSize * i)
          ),
          Math.round(
            curves[curve](light.color[1], to[index].color[1], stepSize * i)
          ),
          Math.round(
            curves[curve](light.color[2], to[index].color[2], stepSize * i)
          ),
        ] as Color,
      }));
      setLights(newLights);
      await asyncTimeout(() => {}, frameSize);
    }
    setLights(to);
    if (this.runID === current) this.runID = 0;
  };
};