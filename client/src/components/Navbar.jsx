import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { admin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Student Register</span>
            <span className="brand-subtitle">Admin Management Portal</span>
          </div>
        </div>

        <div className="navbar-actions">
          {admin && (
            <div className="user-profile">
              <span className="user-avatar" title={`Logged in as ${admin.username}`}>
                {admin.username ? admin.username[0].toUpperCase() : 'A'}
              </span>
              <div className="user-details">
                <span className="user-name">{admin.username}</span>
                <span className="user-badge">Administrator</span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="btn btn-outline btn-sm logout-btn"
            title="Log out of the system"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
