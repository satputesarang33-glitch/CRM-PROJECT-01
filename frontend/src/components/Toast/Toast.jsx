import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../redux/slices/uiSlice';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi';
import './Toast.css';

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FiCheckCircle className="toast-icon success" />;
      case 'error':
        return <FiAlertCircle className="toast-icon error" />;
      case 'warning':
        return <FiAlertTriangle className="toast-icon warning" />;
      default:
        return <FiInfo className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-item toast-${toast.type || 'info'}`}>
      <div className="toast-body">
        {getIcon()}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button
        className="toast-close-btn"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        <FiX />
      </button>
    </div>
  );
};

const Toast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.ui.toasts);

  const handleClose = (id) => {
    dispatch(removeToast(id));
  };

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
};

export default Toast;
