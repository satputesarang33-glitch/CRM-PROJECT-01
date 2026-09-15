import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { FiAlertTriangle } from 'react-icons/fi';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="confirm-dialog-body">
        <div className="confirm-dialog-icon-wrap">
          <FiAlertTriangle className="confirm-dialog-icon" />
        </div>
        <p className="confirm-dialog-message">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
