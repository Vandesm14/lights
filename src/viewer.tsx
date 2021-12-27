import { useState } from 'preact/hooks';

import { Light } from './shared';

export const Viewer = ({ lights, setLights }) => {
  const [drag, setDrag] = useState(false);

  const handleSelect = (id: Light['id']) => {
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: !light.selected };
        }
        return light;
      })
    );
  };

  const handleDragStart = (id: Light['id']) => {
    setDrag(true);
  };

  const handleDragEnd = (id: Light['id']) => {
    setDrag(false);
  };

  const handleDrag = (id: Light['id']) => {
    if (!drag) return;
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          return { ...light, selected: !light.selected };
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
              onClick={() => handleSelect(light.id)}
              onDragStart={() => handleDragStart(light.id)}
              onDragEnd={() => handleDragEnd(light.id)}
              onDrag={(e) => handleDrag(light.id)}
            />
          );
        })}
      </div>
    </div>
  );
};