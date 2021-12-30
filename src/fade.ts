import { asyncTimeout, Color, Light } from './shared';

const defaultMs = 100;

export const linear = (lights: Light[], setLights: (lights: Light[]) => void) => {
  return async (to: Light[], ms = defaultMs) => {
    if (ms === 0) {
      setLights(to);
      return;
    }
    const steps = ms / 10;
    const stepSize = 1 / steps;
    for (let i = 0; i < steps; i++) {
      const newLights = lights.map((light, index) => ({
        ...light,
        color: [
          Math.round(light.color[0] + (to[index].color[0] - light.color[0]) * stepSize * i),
          Math.round(light.color[1] + (to[index].color[1] - light.color[1]) * stepSize * i),
          Math.round(light.color[2] + (to[index].color[2] - light.color[2]) * stepSize * i),
        ] as Color,
      }));
      setLights(newLights);
      await asyncTimeout(() => {}, 1/30);
    }
  }
}