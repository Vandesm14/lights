import { useState } from 'preact/hooks';

import { Light } from './shared';

interface ViewerProps {
  lights: Light[];
  setLights: (lights: Light[]) => void;
}

export const Viewer = ({ lights, setLights }: ViewerProps) => {
  const [drag, setDrag] = useState(false);
  const [dragState, setDragState] = useState(false);

  const handleDragStart = (id: Light['id'], e: MouseEvent) => {
    e.preventDefault();
    if (e.button === 1) return;
    const isLeftClick = e.button === 0;
    setDragState(isLeftClick);
    setDrag(true);
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: isLeftClick };
        }
        return light;
      })
    );
  };

  const handleDragEnd = (id: Light['id'], e: MouseEvent) => {
    e.preventDefault();
    setDrag(false);
  };

  const handleDrag = (id: Light['id']) => {
    if (!drag) return;
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: dragState };
        }
        return light;
      })
    );
  };

  const selectNone = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setLights(lights.map((light) => ({ ...light, selected: false })));
    }
  };

  return (
    <div className="viewer" onClick={selectNone}>
      <div className="grid">
        {lights.map((light) => {
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
              onMouseUp={(e) => handleDragEnd(light.id, e)}
              onMouseOver={(e) => handleDrag(light.id)}
              onTouchStart={(e) => handleDragStart(light.id, e)}
              onTouchEnd={(e) => handleDragEnd(light.id, e)}
              onTouchCancel={(e) => handleDragEnd(light.id, e)}
              onTouchMove={(e) => handleDrag(light.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
