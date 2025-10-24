import React from 'react';
import './Switch.css';

const Switch = React.forwardRef(({ 
  className = '', 
  checked,
  onCheckedChange,
  disabled = false,
  size = 'default',
  ...props 
}, ref) => {
  const handleChange = (e) => {
    onCheckedChange?.(e.target.checked);
  };

  return (
    <label className={`switch-wrapper ${size !== 'default' ? `switch-${size}` : ''} ${disabled ? 'switch-disabled' : ''} ${className}`}>
      <input
        type="checkbox"
        className="switch-input"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      <div className={`switch-ui ${checked ? 'switch-checked' : ''}`}>
        <div className="switch-thumb" />
      </div>
    </label>
  );
});

Switch.displayName = 'Switch';

export { Switch };
