import React, { useEffect } from 'react';

/**
 * Confirmation dialog before permanently deleting a student record.
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, student, isDeleting }) => {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !student) return null;

  return (
    <div className="modal-backdrop" onClick={() => !isDeleting && onClose()}>
      <div
        className="modal-card modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="modal-body text-center p-6">
          <div className="delete-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="delete-icon">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>

          <h3 id="delete-dialog-title" className="delete-title">
            Delete Student Record?
          </h3>

          <p className="delete-desc">
            Are you sure you want to delete <strong>{student.name}</strong> (Roll No:{' '}
            <span className="badge badge-primary">{student.rollNumber}</span>)?
          </p>

          <p className="delete-warning">
            This action cannot be undone. The record will be permanently removed from MongoDB.
          </p>

          <div className="delete-actions">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger w-full"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Deleting...</span>
                </>
              ) : (
                'Yes, Delete Record'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
