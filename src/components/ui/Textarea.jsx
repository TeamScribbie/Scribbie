import React from 'react';
import './Textarea.css';

const Textarea = React.forwardRef(({ 
  className = '', 
  rows = 3,
  ...props 
}, ref) => {
  return (
    <textarea
      className={`textarea-ui ${className}`}
      rows={rows}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
