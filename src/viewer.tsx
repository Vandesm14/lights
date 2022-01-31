import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import { FunctionalComponent } from 'preact';

import { Cue, fillLights, Light } from './shared';
import { Fader } from './lib/fade';

import { Context } from './store';

export const Viewer: FunctionalComponent = () => {
  const [drag, setDrag] = useState(false);
  const [dragState, setDragState] = useState(false);
  const [liveLights, setLiveLights] = useState(fillLights());
  const [fade] = useState(() => Fader(liveLights, setLiveLights));

  const { view, setView, controls, keybinds, setKeybinds, lists } =
    useContext(Context);

  const keyDown = useCallback(
    (e) => {
      const triggeredBinds = keybinds.filter(
        (k) =>
          k.raw.key === e.key &&
          k.raw.ctrlKey === e.ctrlKey &&
          k.raw.shiftKey === e.shiftKey &&
          k.raw.altKey === e.altKey &&
          // don't retrigger if already active
          k.active === false
      );
      for (const bind of triggeredBinds) {
        setKeybinds(
          keybinds.map((k) => (k.id === bind.id ? { ...k, active: true } : k))
        );
      }
    },
    [keybinds]
  );

  const keyUp = useCallback(
    (e) => {
      const triggeredBinds = keybinds.filter(
        (k) =>
          k.raw.key === e.key &&
          k.raw.ctrlKey === e.ctrlKey &&
          k.raw.shiftKey === e.shiftKey &&
          k.raw.altKey === e.altKey
      );
      for (const bind of triggeredBinds) {
        setKeybinds(
          keybinds.map((k) => (k.id === bind.id ? { ...k, active: false } : k))
        );
      }
    },
    [keybinds]
  );

  useEffect(() => {
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    let newView = { ...view };

    for (const bind of keybinds) {
      if (bind.type === 'Flash') {
        if (bind.active) {
          const list = lists.find((el) => el.id === bind.ids[0]);
          if (!list) continue;
          newView = {
            ...newView,
            live: [
              ...newView.live,
              list.cues[0],
            ],
          };
        } else {
          const list = lists.find((el) => el.id === bind.ids[0]);
          if (!list) continue;
          newView = {
            ...newView,
            live: newView.live.filter((el) => el.id !== list.cues[0].id),
          };
        }
      }
    }

    setView(newView);

    return () => {
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
    };
  }, [keybinds]);

  useEffect(() => {
    if (controls.viewMode === 'edit' && view.edit) {
      const newLights: Light[] = liveLights.map((el) =>
        view.edit.ids.includes(el.id)
          ? { ...el, color: view.edit.color }
          : { ...el, color: [0, 0, 0] }
      );
      fade({ to: [...newLights], from: liveLights }, view.edit.duration);
    } else if (view.live?.length > 0) {
      const allIds = new Map<number, Cue>();
      view.live.forEach((c) => c.ids.forEach((l) => allIds.set(l, c)));
      const duration = Math.max(...view.live.map((c) => c.duration));
      const newLights: Light[] = liveLights.map((el) =>
        allIds.has(el.id)
          ? { ...el, color: allIds.get(el.id).color }
          : { ...el, color: [0, 0, 0] }
      );
      fade({ to: [...newLights], from: liveLights }, duration);
    } else {
      fade({ to: fillLights(), from: liveLights }, 100);
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
                  view.edit.ids.includes(light.id) ||
                  controls.viewMode === 'live'
                    ? '1'
                    : '0'
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
