import { useContext, useEffect, useState } from 'preact/hooks';
import { FunctionalComponent } from 'preact';

import { fillLights, Light } from './shared';
import { Fader } from './lib/fade';

import { Context } from './store';

export const Viewer: FunctionalComponent = () => {
  const [drag, setDrag] = useState(false);
  const [dragState, setDragState] = useState(false);
  const [liveLights, setLiveLights] = useState(fillLights());
  const [fade] = useState(() => Fader(liveLights, setLiveLights));

  const { view, setView, controls } = useContext(Context);

  useEffect(() => {
    if (controls.viewMode === 'edit' && view.edit) {
      const newLights = liveLights.map((el) =>
        view.edit.ids.includes(el.id)
          ? { ...el, color: view.edit.color }
          : { ...el, color: [0, 0, 0] }
      );
      fade({ to: [...newLights], from: liveLights }, view.edit.duration);
    } else {
      fade({ to: fillLights(), from: liveLights }, 0);
    }
  }, [view, controls.viewMode]);

  const handleDragStart = (id: Light['id'], e) => {
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

  const handleDragEnd = (e) => {
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

  const selectNone = (e) => {
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
              className={`light
                ${view.edit.ids.includes(light.id) ? 'selected ' : ' '}
              `}
              style={{
                backgroundColor: `rgb(${light.color.join(',')},${
                  view.edit.ids.includes(light.id) || controls.viewMode === 'live' ? '1' : '0'
                })`,
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
