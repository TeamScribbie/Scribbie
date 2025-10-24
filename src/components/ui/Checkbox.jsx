import React from 'react';
import './Checkbox.css';

const Checkbox = React.forwardRef(({ 
  className = '', 
  checked,
  onChange,
  children,
  ...props 
}, ref) => {
  return (
    <label className={`checkbox-wrapper ${className}`}>
      <input
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={onChange}
        ref={ref}
        {...props}
      />
      <div className="checkbox-ui">
        <div className="checkbox-indicator">
          {checked && <span className="checkbox-check">✓</span>}
        </div>
      </div>
      {children && <span className="checkbox-label">{children}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
