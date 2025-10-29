import React, { useState, useEffect } from 'react';
import './Dialog.css';

const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={() => onOpenChange?.(false)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, {
    onClick: (e) => {
      onClick?.(e);
      children.props.onClick?.(e);
    }
  });
};

const DialogContent = ({ className = '', children, ...props }) => {
  return (
    <div className={`dialog-inner ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`dialog-header ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogTitle = ({ className = '', children, ...props }) => {
  return (
    <h2 className={`dialog-title ${className}`} {...props}>
      {children}
    </h2>
  );
};

const DialogDescription = ({ className = '', children, ...props }) => {
  return (
    <p className={`dialog-description ${className}`} {...props}>
      {children}
    </p>
  );
};

const DialogFooter = ({ className = '', children, ...props }) => {
  return (
    <div className={`dialog-footer ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogClose = ({ children, onClick }) => {
  return React.cloneElement(children, {
    onClick: (e) => {
      onClick?.(e);
      children.props.onClick?.(e);
    }
  });
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
};
