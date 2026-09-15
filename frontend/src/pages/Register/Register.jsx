import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerSuccess } from '../../redux/slices/authSlice';
import { addToast } from '../../redux/slices/uiSlice';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateRequired,
  getPasswordStrength,
} from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { FiUser, FiMail, FiPhone, FiLock, FiBriefcase } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

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

    const newErrors = {
      firstName: validateRequired(formData.firstName, 'First Name'),
      lastName: validateRequired(formData.lastName, 'Last Name'),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      ),
    };

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      role: 'Manager',
      department: 'Sales & Business Dev',
    };

    dispatch(
      registerSuccess({
        user: newUser,
        token: `mock-jwt-token-${Date.now()}`,
      })
    );

    dispatch(
      addToast({
        message: 'Account created successfully! Welcome to NexusCRM.',
        type: 'success',
      })
    );

    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <FiBriefcase />
          </div>
          <h2 className="auth-title">Create your CRM Account</h2>
          <p className="auth-subtitle">Join thousands of high-performing sales teams</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row-grid">
            <Input
              label="First Name"
              name="firstName"
              placeholder="e.g. Sarah"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              icon={FiUser}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="e.g. Jenkins"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              icon={FiUser}
              required
            />
          </div>

          <Input
            label="Work Email"
            name="email"
            type="email"
            placeholder="sarah.j@company.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={FiMail}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={FiPhone}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Create strong password"
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
              <span className="strength-label" style={{ color: strength.color }}>
                Strength: {strength.label}
              </span>
            </div>
          )}

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
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
            Create Free Account
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
