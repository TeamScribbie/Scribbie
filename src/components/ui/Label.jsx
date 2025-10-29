import React from 'react';
import './Label.css';

const Label = React.forwardRef(({ 
  className = '', 
  children,
  ...props 
}, ref) => {
  return (
    <label
      ref={ref}
      className={`label-ui ${className}`}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };
