import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToast } from '../../redux/slices/uiSlice';
import {
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import './ResetPassword.css';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    if (passErr || confirmErr) {
      setErrors({
        password: passErr,
        confirmPassword: confirmErr,
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      dispatch(
        addToast({
          message: 'Password updated successfully! Please log in.',
          type: 'success',
        })
      );
    }, 600);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {isSuccess ? (
          <div className="reset-success-state">
            <div className="success-icon-wrap">
              <FiCheckCircle />
            </div>
            <h2 className="auth-title">Password Reset Complete</h2>
            <p className="auth-subtitle">
              Your account password has been updated securely. You can now log in
              with your new credentials.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Sign In With New Password
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Create New Password</h2>
              <p className="auth-subtitle">
                Ensure your new password has at least 6 characters and mixed symbols.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <Input
                label="New Password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={FiLock}
                required
              />

              {formData.password && (
                <div className="password-strength-wrap">
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: `${(strength.score / 5) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: strength.color }}
                  >
                    Strength: {strength.label}
                  </span>
                </div>
              )}

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={FiLock}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="auth-submit-btn"
              >
                Update Password
              </Button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="back-link">
                Cancel and return to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
