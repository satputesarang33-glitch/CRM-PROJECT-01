import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateEmail } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {isSubmitted ? (
          <div className="forgot-success-state">
            <div className="success-icon-wrap">
              <FiCheckCircle />
            </div>
            <h2 className="auth-title">Reset link dispatched</h2>
            <p className="auth-subtitle">
              We have sent password reset instructions to <strong>{email}</strong>.
              Please check your inbox or spam folder.
            </p>
            <div className="mt-4">
              <Link to="/reset-password">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Reset Password
                </Button>
              </Link>
            </div>
            <div className="auth-footer">
              <Link to="/login" className="back-link">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Forgot your password?</h2>
              <p className="auth-subtitle">
                Enter your registered corporate email to receive a recovery link.
              </p>
            </div>

            {error && <div className="auth-alert error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <Input
                label="Registered Email"
                name="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                icon={FiMail}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="auth-submit-btn"
              >
                Send Password Reset Link
              </Button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="back-link">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
