import { useEffect, useState } from 'preact/hooks';

import { fillLights, Light, View } from './shared';
import { Fader } from './fade';

interface ViewerProps {
  view: View;
  setView: (view: View) => void;
}

export const Viewer = ({ view, setView }: ViewerProps) => {
  const [drag, setDrag] = useState(false);
  const [dragState, setDragState] = useState(false);
  const [liveLights, setLiveLights] = useState(fillLights());
  const [fade] = useState(()=>Fader(liveLights, setLiveLights));

  useEffect(() => {
    if (view.edit && fade) {
      const newLights = liveLights.map((el, index) =>
        view.edit.ids.includes(el.id)
          ? { ...el, color: view.edit.color }
          : { ...el, color: [0, 0, 0] }
      );
      // TODO: if this is already running, cancel it and start a new one
      fade({ to: [...newLights], from: liveLights }, view.edit.duration);
    }
  }, [view.edit]);

  const handleDragStart = (id: Light['id'], e: MouseEvent) => {
    e.preventDefault();
    if (e.button === 1) return;
    const isLeftClick = e.button === 0;
    setDragState(isLeftClick);
    setDrag(true);
    if (isLeftClick) {
      setView({ ...view, edit: { ...view.edit, ids: [...view.edit.ids, id] } });
    } else {
      setView({
        ...view,
        edit: { ...view.edit, ids: view.edit.ids.filter((i) => i !== id) },
      });
    }
  };

  const handleDragEnd = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    setDrag(false);
  };

  const handleDrag = (id: Light['id']) => {
    if (!drag) return;
    if (dragState) {
      setView({ ...view, edit: { ...view.edit, ids: [...view.edit.ids, id] } });
    } else {
      setView({
        ...view,
        edit: { ...view.edit, ids: view.edit.ids.filter((i) => i !== id) },
      });
    }
  };

  const selectNone = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !drag) {
      setView({ ...view, edit: { ...view.edit, ids: [] } });
    }
  };

  return (
    <div
      className="viewer"
      onClick={selectNone}
      onMouseOut={handleDragEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="grid">
        {liveLights.map((light) => {
          return (
            <div
              key={light.id}
              className={`light ${
                view.edit.ids.includes(light.id) ? 'selected' : ''
              }`}
              style={{
                backgroundColor: `rgb(${light.color.join(',')})`,
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
