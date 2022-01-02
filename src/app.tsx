import { render } from 'preact';
import 'preact/debug';

import { Editor } from './editor';
import { Viewer } from './viewer';
import { KeyEditor } from './keyeditor';
import { Tabs, Tab } from './lib/tabs';

import { Store } from './store';
import { Controls } from './controls';

const App = () => {
  return (
    <main>
      <div className="vstack">
        <Controls />
        <Tabs>
          <Tab name="Cue(List) Editor">
            <Editor />
          </Tab>
          <Tab name="Keybind Editor">
            <KeyEditor />
          </Tab>
        </Tabs>
      </div>
      <Viewer />
    </main>
  );
};

render(
  <Store>
    <App />
  </Store>,
  document.body
);
