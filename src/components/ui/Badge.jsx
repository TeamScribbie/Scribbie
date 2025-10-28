import React from 'react';
import './Badge.css';

const Badge = ({ className = '', variant = 'default', children, ...props }) => {
  const baseClass = 'badge-ui';
  const variantClass = `badge-${variant}`;
  
  return (
    <div className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Badge };
