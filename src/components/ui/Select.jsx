import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

const Select = ({ value, onValueChange, children, placeholder = "Select an option..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="select-wrapper" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        <SelectValue value={selectedValue} placeholder={placeholder} />
      </SelectTrigger>
      {isOpen && (
        <SelectContent>
          {React.Children.map(children, child => 
            React.cloneElement(child, { onSelect: handleSelect, selectedValue })
          )}
        </SelectContent>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, onClick, isOpen, className = '' }) => (
  <button
    type="button"
    className={`select-trigger ${isOpen ? 'select-open' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
    <span className={`select-icon ${isOpen ? 'select-icon-open' : ''}`}>▼</span>
  </button>
);

const SelectValue = ({ value, placeholder }) => (
  <span className="select-value">
    {value || placeholder}
  </span>
);

const SelectContent = ({ children, className = '' }) => (
  <div className={`select-content ${className}`}>
    {children}
  </div>
);

const SelectItem = ({ value, children, onSelect, selectedValue, className = '' }) => (
  <div
    className={`select-item ${selectedValue === value ? 'select-item-selected' : ''} ${className}`}
    onClick={() => onSelect?.(value)}
  >
    {selectedValue === value && <span className="select-check">✓</span>}
    {children}
  </div>
);

const SelectSeparator = ({ className = '' }) => (
  <div className={`select-separator ${className}`} />
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator };
