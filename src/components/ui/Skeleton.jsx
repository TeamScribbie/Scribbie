import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`skeleton ${className}`}
      {...props}
    />
  );
};

export { Skeleton };
