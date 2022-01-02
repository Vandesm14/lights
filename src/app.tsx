import { render } from 'preact';
import 'preact/debug';

import { Editor } from './editor';
import { Viewer } from './viewer';
import { KeyEditor } from './keyeditor';
import { Tabs, Tab } from './lib/tabs';

import { Store } from './store';

const App = () => {
  return (
    <main>
      <Tabs>
        <Tab name="Cue(List) Editor">
          <Editor />
        </Tab>
        <Tab name="Keybind Editor">
          <KeyEditor />
        </Tab>
      </Tabs>
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
