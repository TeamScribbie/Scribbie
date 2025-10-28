import React from 'react';
import './Alert.css';

const Alert = React.forwardRef(({ className = '', variant = 'default', children, ...props }, ref) => {
  const baseClass = 'alert-ui';
  const variantClass = `alert-${variant}`;
  
  return (
    <div 
      ref={ref} 
      role="alert" 
      className={`${baseClass} ${variantClass} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <h5 ref={ref} className={`alert-title ${className}`} {...props}>
    {children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`alert-description ${className}`} {...props}>
    {children}
  </div>
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
