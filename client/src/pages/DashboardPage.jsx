import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SearchFilter from '../components/SearchFilter';
import StudentFormModal from '../components/StudentFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Alert from '../components/Alert';
import api from '../services/api';

const DashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch all students from API
   */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/students');
      if (response.data?.success) {
        setStudents(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Network error: Cannot reach the backend API. Please make sure the backend server is running.'
          : 'Failed to load students. Please check backend connection.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /**
   * Filtered students based on search term
   * Matches across name, rollNumber, and studentClass
   */
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase().trim();

    return students.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const roll = (s.rollNumber || '').toLowerCase();
      const sClass = (s.studentClass || s.class || '').toLowerCase();
      const addr = (s.address || '').toLowerCase();

      return (
        name.includes(term) ||
        roll.includes(term) ||
        sClass.includes(term) ||
        addr.includes(term)
      );
    });
  }, [students, searchTerm]);

  /**
   * Calculate summary statistics
   */
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const uniqueClasses = new Set(
      students.map((s) => (s.studentClass || s.class || '').trim().toLowerCase())
    ).size;

    return {
      totalStudents,
      uniqueClasses,
    };
  }, [students]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  /**
   * Submit Create or Edit student
   */
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedStudent && selectedStudent._id) {
        // Update existing student
        const response = await api.put(`/api/students/${selectedStudent._id}`, formData);
        const updated = response.data.data;
        setStudents((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );
        setSuccessMessage(`Student "${updated.name}" updated successfully!`);
      } else {
        // Create new student
        const response = await api.post('/api/students', formData);
        const created = response.data.data;
        setStudents((prev) => [created, ...prev]);
        setSuccessMessage(`Student "${created.name}" registered successfully!`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Confirm Delete student
   */
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/students/${studentToDelete._id}`);
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      setSuccessMessage(
        `Student "${studentToDelete.name}" (Roll: ${studentToDelete.rollNumber}) deleted successfully.`
      );
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.message || 'Failed to delete student record.';
      setError(msg);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Success Banner */}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              autoClose={4000}
            />
          )}

          {/* Error Banner */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              autoClose={false}
            />
          )}

          {/* Stats Bar */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Registered Students</span>
                <span className="stat-value">{stats.totalStudents}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Active Classes / Batches</span>
                <span className="stat-value">{stats.uniqueClasses}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-emerald">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Database Status</span>
                <span className="stat-badge-online">Mongoose Connected</span>
              </div>
            </div>
          </div>

          {/* Action Header & Search */}
          <div className="action-header">
            <div className="action-header-left">
              <h2 className="section-title">Student Registry</h2>
              <p className="section-subtitle">
                Manage, search, register, update, and remove student records.
              </p>
            </div>

            <div className="action-header-right">
              <button
                type="button"
                onClick={fetchStudents}
                className="btn btn-secondary btn-icon-only"
                title="Refresh table"
                disabled={loading}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={loading ? 'spin' : ''}
                >
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="btn btn-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar-wrap">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalCount={students.length}
              filteredCount={filteredStudents.length}
            />
          </div>

          {/* Table Container */}
          <div className="table-card">
            {loading ? (
              <div className="table-loading-state">
                <div className="spinner"></div>
                <p>Loading student records from database...</p>
              </div>
            ) : error && students.length === 0 ? (
              <div className="table-error-state">
                <div className="error-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3>Failed to load records</h3>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={fetchStudents}
                  className="btn btn-primary btn-sm mt-3"
                >
                  Try Again
                </button>
              </div>
            ) : students.length === 0 ? (
              <div className="table-empty-state">
                <div className="empty-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <h3>No Students Registered Yet</h3>
                <p>Start building your register by creating the first student record.</p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="btn btn-primary mt-3"
                >
                  + Add First Student
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="table-empty-state">
                <div className="empty-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3>No Matching Students Found</h3>
                <p>No student records match your search criteria "{searchTerm}".</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="btn btn-secondary mt-3"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Roll No.</th>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Address</th>
                      <th>Registered</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <span className="roll-badge">{s.rollNumber}</span>
                        </td>
                        <td>
                          <div className="student-name-cell">
                            <span className="student-avatar-sm">
                              {(s.name || 'S')[0].toUpperCase()}
                            </span>
                            <span className="student-name-text">{s.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="class-tag">{s.studentClass || s.class}</span>
                        </td>
                        <td>
                          <span className="address-text" title={s.address}>
                            {s.address}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons-group">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleOpenEditModal(s)}
                              title="Edit student details"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleOpenDeleteModal(s)}
                              title="Delete student"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        student={selectedStudent}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        student={studentToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
