import React from 'react';
import { FiFilter } from 'react-icons/fi';
import './Filter.css';

const Filter = ({
  label = 'Filter',
  value,
  onChange,
  options = [],
  className = '',
}) => {
  return (
    <div className={`filter-wrap ${className}`}>
      <FiFilter className="filter-icon" />
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={idx} value={val}>
              {label ? `${label}: ${lbl}` : lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Filter;
