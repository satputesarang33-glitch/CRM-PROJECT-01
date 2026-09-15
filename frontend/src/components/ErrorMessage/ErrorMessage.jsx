import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import Button from '../Button/Button';
import './ErrorMessage.css';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'Unable to load information. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`error-message-card ${className}`}>
      <div className="error-icon-wrap">
        <FiAlertCircle className="error-icon" />
      </div>
      <h4 className="error-title">{title}</h4>
      <p className="error-desc">{message}</p>
      {onRetry && (
        <Button variant="secondary" icon={FiRefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
