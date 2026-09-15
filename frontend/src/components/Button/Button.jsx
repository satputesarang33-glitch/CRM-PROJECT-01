import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    isLoading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <span className="btn-spinner" aria-hidden="true" />}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="btn-icon left" />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="btn-icon right" />}
    </button>
  );
};

export default Button;
