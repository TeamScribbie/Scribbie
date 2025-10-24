import React, { useState, createContext, useContext } from 'react';
import './Tabs.css';

const TabsContext = createContext();

const Tabs = ({ defaultValue, value, onValueChange, children, className = '', ...props }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : activeTab;

  return (
    <TabsContext.Provider value={{ activeTab: currentValue, onTabChange: handleTabChange }}>
      <div className={`tabs-root ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '', ...props }) => (
  <div className={`tabs-list ${className}`} {...props}>
    {children}
  </div>
);

const TabsTrigger = ({ value, children, className = '', disabled = false, ...props }) => {
  const { activeTab, onTabChange } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      className={`tabs-trigger ${isActive ? 'tabs-trigger-active' : ''} ${disabled ? 'tabs-trigger-disabled' : ''} ${className}`}
      onClick={() => !disabled && onTabChange(value)}
      disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '', ...props }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }

  return (
    <div 
      className={`tabs-content ${className}`}
      data-state="active"
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
