import React from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from '../Button/Button';
import './EmptyState.css';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No records found',
  description = 'There are no items matching your criteria. Try adjusting your filters or adding a new record.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`empty-state-card ${className}`}>
      <div className="empty-state-icon-wrap">
        <Icon className="empty-state-icon" />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
