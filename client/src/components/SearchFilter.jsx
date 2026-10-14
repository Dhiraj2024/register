import React from 'react';

/**
 * Search input component for filtering students by Name, Roll Number, or Class
 */
const SearchFilter = ({ searchTerm, onSearchChange, totalCount, filteredCount }) => {
  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by student name, roll number, or class..."
          className="search-input"
          aria-label="Search students"
        />

        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="search-results-badge">
          Showing {filteredCount} of {totalCount} students
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
