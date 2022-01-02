import { Component, ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

export interface TabsProps {
  children?: Component<TabProps>[]
}

export const Tabs = ({ children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const isArray = Array.isArray(children);

  return (
    <div className="tabs">
      <div className="menu hstack">
        {isArray && children.map((child, i) => (
          <button
            className={`pill ${i === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {child.props.title ?? child.props.name}
          </button>
        ))}
      </div>
      <div className="content">{children[activeTab]}</div>
    </div>
  );
};

export interface TabProps {
  title?: string;
  name?: string;
  children?: ComponentChildren;
}

export const Tab = ({ title, children }: TabProps) => {
  return (
    <div className="tab">
      { title ? <h2>{title}</h2> : null }
      {children}
    </div>
  );
};
