import { Component, render } from 'preact';
import 'preact/debug';

const out = document.getElementById('out');

type Color = [number, number, number];

interface ILight {
  id: number;
  color: Color;
  selected: boolean;
}

class Light extends Component<ILight, {}> {
  render() {
    const { color, selected } = this.props;
    const style = {
      backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    };
    return (
      <div className={`light ${selected ? 'selected' : ''}`} style={style} />
    );
  }
}

interface Cue {
  duration: number;
  ids: ILight['id'][];
  color: ILight['color'];
}

interface CueList {
  id: number;
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
  type: KeybindType
}

interface IApp {
  state: {
    lights: ILight[];
  }
}

function hslToRgb([h, s, l]: Color): Color {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsl(rgb: Color): Color {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const h = (max + min) / 2;
  const s = h;
  const l = h;

  return [h * 360, s, l];
}

function testPattern(transform: App['transform'], get: App['getLights']) {
  const lights = get();
  const saturation = 1;
  const lightness = 0.5;

  const increaseBy = 1;

  for (let i = 0; i < lights.length; i++) {
    const light = lights[i];
    if (i === 0) out.innerHTML = light.color.join();
    const hsl = rgbToHsl(light.color);
    const hue = (hsl[0] + increaseBy*i*2) % 360;
    const rgb: Color = hslToRgb([hue/360, saturation, lightness]);
    transform({ ...light, color: rgb });
  }
  console.log(get().map(el => el.color));
  // requestAnimationFrame(() => testPattern(transform, get));
}

class App extends Component<{}, IApp['state']> {
  state: IApp['state'] = {
    lights: []
  };

  getLights = () => {
    return this.state.lights;
  }

  transform = (payload: Partial<ILight> & { id: ILight['id'] }) => {
    const lights = this.state.lights;
    const light = lights.find(el => el.id === payload.id);
    let newLight: ILight;

    if (light) {
      newLight = { ...light, ...payload };
      lights[lights.findIndex(el => el.id === newLight.id)] = newLight;
      this.setState({ lights });
    } else {
      throw new Error(`Cannot perform transform, light with id: "${payload.id}" not found`);
    }
  }

  componentDidMount() {
    this.fillLights();
  }

  // TODO: allow custom width & height
  fillLights(height = 8, width = 8, defaultProps?: Partial<ILight>) {
    const lights = [];
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        lights.push({
          id: i * width + j,
          color: [0, 0, 0],
          selected: false,
          ...defaultProps
        });
      }
    }
    this.setState({ lights });
  }

  render({ }, { lights }) {
    return (
      <main>
        <div className="viewer">
          {lights.map(light => {
            return (
              <div
                className={`light ${light.selected ? 'selected' : ''}`}
                style={{
                  backgroundColor: `rgb(${light.color.join(',')})`
                }}
              />
            );
          })}
        </div>
        <button onClick={() => testPattern(this.transform, this.getLights)}>Test Pattern</button>
      </main>
    );
  }
}

render(<App />, document.body);