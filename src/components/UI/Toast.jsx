import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container">
      {message}
    </div>
  );
};

export default Toast;
