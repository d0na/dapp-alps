import React, { useState, useEffect } from 'react';
import { Toast as ReactstrapToast, ToastBody, ToastHeader } from 'reactstrap';

const Toast = ({ 
  isOpen, 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getToastColor = () => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-success';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '✅';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px'
      }}
    >
      <ReactstrapToast isOpen={isOpen}>
        <ToastHeader 
          icon={getIcon()}
          toggle={onClose}
          className={getToastColor()}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </ToastHeader>
        <ToastBody>
          {message}
        </ToastBody>
      </ReactstrapToast>
    </div>
  );
};

export default Toast;
