import React from 'react';
import './Progress.css';

const Progress = React.forwardRef(({ 
  className = '', 
  value = 0,
  max = 100,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div 
      ref={ref}
      className={`progress-ui ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div 
        className="progress-indicator"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };
