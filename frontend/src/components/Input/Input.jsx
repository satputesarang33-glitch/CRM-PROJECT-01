import React from 'react';
import './Input.css';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  hint,
  className = '',
  ...rest
}) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-field ${Icon ? 'has-icon' : ''}`}
          {...rest}
        />
      </div>

      {hint && !error && <span className="input-hint">{hint}</span>}
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;
