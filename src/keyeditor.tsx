import type { Keybind } from './shared';

import { useState } from 'react';

interface KeyEditorProps {
  keybinds: Keybind[];
  setKeybinds: (keybinds: Keybind[]) => void;
}

export const KeyEditor = ({ keybinds, setKeybinds }: KeyEditorProps) => {
  return (
    <div className="editor">
      <h1>Keybinds</h1>
      <div className="controls">
        <div className="hstack">
          <button>Add Keybind</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Cues</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keybinds.length > 0 ? (
            keybinds.map((keybind) => (
              <tr key={keybind.key}>
                <td>{keybind.key}</td>
                <td>{keybind.ids.join(', ')}</td>
                <td>{keybind.type}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
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
