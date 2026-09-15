import React from 'react';
import './Textarea.css';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  rows = 4,
  placeholder,
  error,
  required = false,
  disabled = false,
  hint,
  className = '',
  ...rest
}) => {
  return (
    <div className={`textarea-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="textarea-field"
        {...rest}
      />

      {hint && !error && <span className="textarea-hint">{hint}</span>}
      {error && <span className="textarea-error-text">{error}</span>}
    </div>
  );
};

export default Textarea;
