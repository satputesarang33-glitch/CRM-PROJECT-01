import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiLock,
  FiSave,
  FiCheckCircle,
  FiCamera,
} from 'react-icons/fi';
import { updateProfile } from '../../redux/slices/authSlice';
import { addToast } from '../../redux/slices/uiSlice';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { getInitials } from '../../utils/helpers';
import {
  validateEmail,
  validateRequired,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validation';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Morgan',
    email: user?.email || 'alex.morgan@nexuscrm.com',
    phone: user?.phone || '+1 (555) 234-5678',
    department: user?.department || 'Executive Management',
  });

  const [profileErrors, setProfileErrors] = useState({});

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    const errors = {
      name: validateRequired(profileForm.name, 'Full Name'),
      email: validateEmail(profileForm.email),
    };

    if (Object.values(errors).some(Boolean)) {
      setProfileErrors(errors);
      return;
    }

    dispatch(updateProfile(profileForm));
    dispatch(
      addToast({
        message: 'Profile details updated successfully',
        type: 'success',
      })
    );
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();

    const errors = {
      currentPassword: validateRequired(
        passwordForm.currentPassword,
        'Current Password'
      ),
      newPassword: validatePassword(passwordForm.newPassword),
      confirmPassword: validateConfirmPassword(
        passwordForm.newPassword,
        passwordForm.confirmPassword
      ),
    };

    if (Object.values(errors).some(Boolean)) {
      setPasswordErrors(errors);
      return;
    }

    dispatch(
      addToast({
        message: 'Security password changed successfully',
        type: 'success',
      })
    );

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="page-container profile-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Profile & Credentials</h1>
          <p className="page-subtitle">
            Manage your personal representation, contact channels, and security keys
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: Avatar & Overview Card */}
        <div className="card profile-overview-card">
          <div className="profile-avatar-wrap">
            <div className="avatar avatar-xl">
              {getInitials(user?.name || 'Alex Morgan')}
            </div>
            <button
              className="avatar-edit-badge"
              title="Change Profile Photo"
              onClick={() =>
                dispatch(
                  addToast({
                    message: 'Photo upload dialog simulation',
                    type: 'info',
                  })
                )
              }
            >
              <FiCamera />
            </button>
          </div>

          <h2 className="overview-user-name">{user?.name || 'Alex Morgan'}</h2>
          <p className="overview-user-email">{user?.email || 'alex.m@nexuscrm.com'}</p>
          <span className="badge badge-purple mt-2">
            <FiShield /> {user?.role || 'Admin'}
          </span>

          <div className="overview-meta-list">
            <div className="meta-row">
              <span className="meta-label">Department</span>
              <span className="meta-val">{user?.department || 'Operations'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Account Status</span>
              <span className="badge badge-success">Active Session</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Two-Factor Auth</span>
              <span className="badge badge-success">Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="profile-forms-col">
          {/* Edit Profile Form */}
          <div className="card profile-form-card">
            <div className="form-card-header">
              <h3 className="form-section-title">Edit Profile Information</h3>
              <p className="form-section-desc">
                Update your public profile display name and contact handles
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-grid-2">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  error={profileErrors.name}
                  icon={FiUser}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  error={profileErrors.email}
                  icon={FiMail}
                  required
                />
              </div>

              <div className="form-grid-2">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  icon={FiPhone}
                />
                <Input
                  label="Department"
                  name="department"
                  value={profileForm.department}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-submit-row">
                <Button type="submit" variant="primary" icon={FiSave}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card profile-form-card">
            <div className="form-card-header">
              <h3 className="form-section-title">Change Password</h3>
              <p className="form-section-desc">
                Ensure your account is protected with a strong, distinct password
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="profile-form">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                icon={FiLock}
                required
              />

              <div className="form-grid-2">
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.newPassword}
                  icon={FiLock}
                  required
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.confirmPassword}
                  icon={FiLock}
                  required
                />
              </div>

              <div className="form-submit-row">
                <Button type="submit" variant="secondary" icon={FiLock}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
