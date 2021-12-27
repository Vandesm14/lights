import { useState } from 'preact/hooks';

import { Light } from './shared';

interface ViewerProps {
  lights: Light[];
  setLights: (lights: Light[]) => void;
}

export const Viewer = ({ lights, setLights }: ViewerProps) => {
  const [drag, setDrag] = useState(false);
  const [dragState, setDragState] = useState(false);

  const handleDragStart = (id: Light['id']) => {
    const newState = !lights.find(el => el.id === id).selected
    setDragState(newState);
    setDrag(true);
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: newState };
        }
        return light;
      })
    )
  };

  const handleDragEnd = (id: Light['id']) => {
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
              onMouseDown={() => handleDragStart(light.id)}
              onMouseUp={() => handleDragEnd(light.id)}
              onMouseOver={(e) => handleDrag(light.id)}

              onTouchStart={() => handleDragStart(light.id)}
              onTouchEnd={() => handleDragEnd(light.id)}
              onTouchCancel={() => handleDragEnd(light.id)}
              onTouchMove={(e) => handleDrag(light.id)}
            />
          );
        })}
      </div>
    </div>
  );
};