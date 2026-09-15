import React from 'react';
import './Select.css';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  hint,
  className = '',
  ...rest
}) => {
  return (
    <div className={`select-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}

      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="select-field"
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option, idx) => {
            const isObj = typeof option === 'object' && option !== null;
            const val = isObj ? option.value : option;
            const lbl = isObj ? option.label : option;
            return (
              <option key={idx} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      </div>

      {hint && !error && <span className="select-hint">{hint}</span>}
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;
