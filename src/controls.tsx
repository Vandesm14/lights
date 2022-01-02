import { FunctionalComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { Context } from './store';

export const Controls: FunctionalComponent = () => {
  const { controls, setControls } = useContext(Context);

  const toggleViewMode = () => {
    const boolean = controls.viewMode === 'live';
    setControls({ ...controls, viewMode: boolean ? 'edit' : 'live' });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="controls">
      <button onClick={toggleViewMode}>View Mode: {capitalizeFirstLetter(controls.viewMode)}</button>
    </div>
  );
};
