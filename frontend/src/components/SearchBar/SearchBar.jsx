import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`search-bar-wrap ${className}`}>
      <FiSearch className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => (onClear ? onClear() : onChange(''))}
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
