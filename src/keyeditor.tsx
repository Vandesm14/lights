import { Keybind, KeybindType } from './shared';
import { newKeybind } from './shared';
import { ComboInput } from './lib/comboinput';

import { useContext } from 'preact/hooks';
import { Context } from './store';

export const KeyEditor = () => {
  const { keybinds, setKeybinds, lists } = useContext(Context);

  const addKeybind = (keybind: Keybind) => {
    setKeybinds([...keybinds, keybind]);
  };

  const removeKeybind = (id: string) => {
    setKeybinds(keybinds.filter((keybind) => keybind.id !== id));
  };

  return (
    <div className="editor">
      <h1>Keybinds</h1>
      <div className="controls">
        <div className="hstack">
          <button onClick={() => addKeybind(newKeybind())}>Add Keybind</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Cue</th>
            <th>Type</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {keybinds.length > 0 ? (
            keybinds.map((keybind) => (
              <tr key={keybind.id}>
                <td>
                  <ComboInput
                    keybind={keybind}
                    keybinds={keybinds}
                    setKeybinds={setKeybinds}
                  />
                </td>
                <td>
                  {/* a dropdown for all of the cuelists */}
                  <select
                    value={keybind.ids[0] ?? lists[0].id}
                    onChange={(e) => {
                      const newKeybind = { ...keybind, ids: [e.target.value] };
                      setKeybinds(
                        keybinds.map((k) =>
                          k.id === keybind.id ? newKeybind : k
                        )
                      );
                    }}
                  >
                    {lists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={keybind.type}
                    onChange={(e) => {
                      const newKeybind = {
                        ...keybind,
                        type: e.target.value as KeybindType,
                      };
                      setKeybinds(
                        keybinds.map((k) =>
                          k.id === keybind.id ? newKeybind : k
                        )
                      );
                    }}
                  >
                    {Object.keys(KeybindType)
                      .filter((el) => isNaN(Number(el)))
                      .map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <div className="hstack">
                    <button onClick={() => removeKeybind(keybind.id)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={20}>No Keybinds</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
