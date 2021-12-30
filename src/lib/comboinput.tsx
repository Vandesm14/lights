import type { Keybind } from '../shared';

import { useState } from 'preact/hooks';

const raw = (e?: KeyboardEvent) => {
  if (e) {
    return {
      key: e.key,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    };
  } else {
    return {
      key: '',
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    };
  }
};

interface ComboInputProps {
  keybind: Keybind;
  keybinds: Keybind[];
  setKeybinds: (keybinds: Keybind[]) => void;
}

export const ComboInput = ({
  keybind,
  keybinds,
  setKeybinds,
}: ComboInputProps) => {
  const [value, setValue] = useState(keybind.key);
  const [error, setError] = useState('');

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') {
      e.preventDefault();
      const shift = e.shiftKey ? 'Shift + ' : '';
      const ctrl = e.ctrlKey ? 'Ctrl + ' : '';
      const alt = e.altKey ? 'Alt + ' : '';
      const numpad = e.location === 3 ? 'Numpad ' : '';
      const key = e.key.length > 1 ? e.key : e.key.toUpperCase();
      const val = shift + ctrl + alt + numpad + key;

      if (
        keybinds.some((el) => (el.id !== keybind.id ? el.key === val : false))
      ) {
        setError('Key already bound');
      } else {
        setValue(val);
        setError('');
        setKeybinds(
          keybinds.map((el) =>
            el.id === keybind.id ? { ...el, key: val, raw: raw(e) } : el
          )
        );
      }
    } else {
      setValue('');
      setError('');
      setKeybinds(
        keybinds.map((el) =>
          el.id === keybind.id ? { ...el, key: '', raw: raw() } : el
        )
      );
    }
  };

  return (
    <input
      type="text"
      onKeyDown={handleKeyDown}
      onBlur={() => setError('')}
      value={value}
      style={{ outline: error.length > 0 ? '1px solid red' : undefined }}
      readOnly
    />
  );
};
