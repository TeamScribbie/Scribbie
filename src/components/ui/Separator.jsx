import React from 'react';
import './Separator.css';

const Separator = React.forwardRef(({ 
  className = '', 
  orientation = 'horizontal',
  decorative = true,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`separator ${orientation === 'vertical' ? 'separator-vertical' : 'separator-horizontal'} ${className}`}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';

export { Separator };
