import { useEffect, useState } from 'preact/hooks';

import { Light, View } from './shared';
import { linear } from './fade';

interface ViewerProps {
  lights: Light[];
  setLights: (lights: Light[]) => void;
  view: View;
}

export const Viewer = ({ lights, setLights, view }: ViewerProps) => {
  const [drag, setDrag] = useState(false);
  const [dragState, setDragState] = useState(false);
  const [liveLights, setLiveLights] = useState(lights);

  const fadeLinear = linear(liveLights, setLiveLights);

  useEffect(() => {
    if (view.edit[0]) {
      const newLights = lights.map((el) =>
        view.edit[0].ids.includes(el.id)
          ? { ...el, color: view.edit[0].color }
          : el
      );
      // TODO: if this is already running, cancel it and start a new one
      fadeLinear([...newLights], view.edit[0].duration);
    }
  }, [view.edit[0]]);

  const handleDragStart = (id: Light['id'], e: MouseEvent) => {
    e.preventDefault();
    if (e.button === 1) return;
    const isLeftClick = e.button === 0;
    setDragState(isLeftClick);
    setDrag(true);
    setLights(
      liveLights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: isLeftClick };
        }
        return light;
      })
    );
  };

  const handleDragEnd = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    setDrag(false);
  };

  const handleDrag = (id: Light['id']) => {
    if (!drag) return;
    setLights(
      liveLights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: dragState };
        }
        return light;
      })
    );
  };

  const selectNone = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !drag) {
      setLights(liveLights.map((light) => ({ ...light, selected: false })));
    }
  };

  return (
    <div className="viewer" onClick={selectNone} onMouseOut={handleDragEnd}>
      <div className="grid">
        {liveLights.map((light) => {
          return (
            <div
              key={light.id}
              className={`light ${light.selected ? 'selected' : ''}`}
              style={{
                backgroundColor: `rgb(${light.color.join(',')})`,
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                return false;
              }}
              onMouseDown={(e) => handleDragStart(light.id, e)}
              onMouseUp={handleDragEnd}
              onMouseOver={(e) => handleDrag(light.id)}
              onTouchStart={(e) => handleDragStart(light.id, e)}
              onTouchEnd={handleDragEnd}
              onTouchCancel={handleDragEnd}
              onTouchMove={(e) => handleDrag(light.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
