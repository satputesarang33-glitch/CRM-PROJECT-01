import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';
import { addToast } from '../../redux/slices/uiSlice';
import { validateEmail, validatePassword } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { FiMail, FiLock, FiBriefcase } from 'react-icons/fi';
import api from '../../services/api';
import './Login.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: 'admin@crmdemo.com',
    password: 'Password123!',
    rememberMe: true,
  });

  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr,
        password: passErr,
      });
      return;
    }

    dispatch(loginStart());

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch(
        loginSuccess({
          user,
          token,
        })
      );

      dispatch(
        addToast({
          message: `Welcome back, ${user.firstName || 'User'}! Logged in successfully.`,
          type: 'success',
        })
      );

      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errorMsg));
      dispatch(
        addToast({
          message: errorMsg,
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo and Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <FiBriefcase />
          </div>
          <h2 className="auth-title">Welcome to NexusCRM</h2>
          <p className="auth-subtitle">Sign in to manage your customer relationships</p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={FiMail}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={FiLock}
            required
          />

          <div className="auth-form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me for 30 days</span>
            </label>

            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="auth-submit-btn"
          >
            Sign In to Dashboard
          </Button>

          <div className="auth-demo-box">
            <span className="demo-tag">DEMO CREDENTIALS PRE-FILLED</span>
            <p>Click Sign In to explore the dashboard as an Admin.</p>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
