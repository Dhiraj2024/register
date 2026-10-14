import React, { useState, useEffect } from 'react';
import Alert from './Alert';

/**
 * Modal dialog for Creating and Editing student records.
 */
const StudentFormModal = ({ isOpen, onClose, onSubmit, student, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentClass: '',
    rollNumber: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const isEditing = Boolean(student && student._id);

  // Populate or reset form whenever modal opens or student changes
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        studentClass: student.studentClass || student.class || '',
        rollNumber: student.rollNumber || '',
        address: student.address || '',
      });
    } else {
      setFormData({
        name: '',
        studentClass: '',
        rollNumber: '',
        address: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [student, isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific validation error on user input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student Name is required.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    if (!formData.studentClass.trim()) {
      newErrors.studentClass = 'Class is required (e.g. 10-A, BCA Sem 2).';
    } else if (formData.studentClass.trim().length > 50) {
      newErrors.studentClass = 'Class cannot exceed 50 characters.';
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll Number is required.';
    } else if (formData.rollNumber.trim().length > 30) {
      newErrors.rollNumber = 'Roll Number cannot exceed 30 characters.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
    } else if (formData.address.trim().length > 300) {
      newErrors.address = 'Address cannot exceed 300 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while saving the student record.';
      setServerError(errorMsg);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !isSubmitting && onClose()}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon">
              {isEditing ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              )}
            </div>
            <div>
              <h2 id="modal-title" className="modal-title">
                {isEditing ? 'Edit Student Details' : 'Register New Student'}
              </h2>
              <p className="modal-subtitle">
                {isEditing
                  ? 'Update information for the selected student.'
                  : 'Enter student information to add them to the registry.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {serverError && (
              <Alert
                type="error"
                message={serverError}
                onClose={() => setServerError('')}
                autoClose={false}
              />
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Student Name <span className="required-star">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="rollNumber" className="form-label">
                  Roll Number <span className="required-star">*</span>
                </label>
                <input
                  id="rollNumber"
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. 101 or CS-2024-01"
                  className={`form-input ${errors.rollNumber ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.rollNumber ? (
                  <span className="field-error">{errors.rollNumber}</span>
                ) : (
                  <span className="field-hint">Roll numbers must be unique across all students.</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="studentClass" className="form-label">
                Class / Grade / Semester <span className="required-star">*</span>
              </label>
              <input
                id="studentClass"
                type="text"
                name="studentClass"
                value={formData.studentClass}
                onChange={handleChange}
                placeholder="e.g. 10th-A, BCA 3rd Sem, Grade 12"
                className={`form-input ${errors.studentClass ? 'input-error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.studentClass && <span className="field-error">{errors.studentClass}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Permanent Address <span className="required-star">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 College Road, Springfield"
                rows="3"
                className={`form-input form-textarea ${errors.address ? 'input-error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
