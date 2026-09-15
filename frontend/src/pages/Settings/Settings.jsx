import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiSettings,
  FiBell,
  FiMoon,
  FiSun,
  FiGlobe,
  FiSave,
  FiCheck,
} from 'react-icons/fi';
import { toggleTheme, setTheme, addToast } from '../../redux/slices/uiSlice';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import './Settings.css';

const Settings = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'notifications' | 'appearance'

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Nexus Enterprise Solutions',
    timezone: 'UTC+05:30 (India Standard Time - IST)',
    currency: 'INR (₹) — Indian Rupee',
    dateFormat: 'DD/MM/YYYY',
  });

  // Notification Settings State
  const [notifSettings, setNotifSettings] = useState({
    emailDealUpdates: true,
    emailTaskReminders: true,
    browserAlerts: true,
    weeklyDigest: false,
  });

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotifToggle = (key) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    dispatch(
      addToast({
        message: 'System general preferences saved',
        type: 'success',
      })
    );
  };

  const handleSaveNotifs = (e) => {
    e.preventDefault();
    dispatch(
      addToast({
        message: 'Notification preferences updated',
        type: 'success',
      })
    );
  };

  return (
    <div className="page-container settings-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings & Preferences</h1>
          <p className="page-subtitle">
            Configure application parameters, appearance themes, and alert rules
          </p>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Settings Navigation Tabs */}
        <div className="card settings-nav-card">
          <button
            className={`settings-nav-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FiSettings /> General Settings
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />} Appearance & Theme
          </button>
          <button
            className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell /> Notification Rules
          </button>
        </div>

        {/* Content Box */}
        <div className="settings-content-card card">
          {/* GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="settings-form">
              <div className="settings-section-header">
                <h3 className="section-title">General Preferences</h3>
                <p className="section-desc">Organization branding and localization rules</p>
              </div>

              <div className="form-grid-2">
                <Input
                  label="Company Name"
                  name="companyName"
                  value={generalSettings.companyName}
                  onChange={handleGeneralChange}
                  icon={FiGlobe}
                  required
                />
                <Select
                  label="System Currency"
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralChange}
                  options={['INR (₹) — Indian Rupee']}
                />
              </div>

              <div className="form-grid-2">
                <Select
                  label="Default Timezone"
                  name="timezone"
                  value={generalSettings.timezone}
                  onChange={handleGeneralChange}
                  options={[
                    'UTC+05:30 (India Standard Time - IST)',
                    'UTC+00:00 (London, GMT)',
                    'UTC-05:00 (Eastern Time)',
                    'UTC-08:00 (Pacific Time)',
                  ]}
                />
                <Select
                  label="Date Format"
                  name="dateFormat"
                  value={generalSettings.dateFormat}
                  onChange={handleGeneralChange}
                  options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']}
                />
              </div>

              <div className="settings-submit-row">
                <Button type="submit" variant="primary" icon={FiSave}>
                  Save General Settings
                </Button>
              </div>
            </form>
          )}

          {/* APPEARANCE SETTINGS */}
          {activeTab === 'appearance' && (
            <div className="settings-theme-view">
              <div className="settings-section-header">
                <h3 className="section-title">Display & Appearance Theme</h3>
                <p className="section-desc">
                  Customize interface visual appearance and theme modes
                </p>
              </div>

              <div className="theme-options-grid">
                {/* Light Theme Card */}
                <div
                  className={`theme-picker-card ${theme === 'light' ? 'selected' : ''}`}
                  onClick={() => dispatch(setTheme('light'))}
                >
                  <div className="theme-preview-box light-preview">
                    <div className="preview-nav" />
                    <div className="preview-body">
                      <div className="preview-sidebar" />
                      <div className="preview-content" />
                    </div>
                  </div>
                  <div className="theme-info-row">
                    <span>Light Mode</span>
                    {theme === 'light' && <FiCheck className="check-icon" />}
                  </div>
                </div>

                {/* Dark Theme Card */}
                <div
                  className={`theme-picker-card ${theme === 'dark' ? 'selected' : ''}`}
                  onClick={() => dispatch(setTheme('dark'))}
                >
                  <div className="theme-preview-box dark-preview">
                    <div className="preview-nav" />
                    <div className="preview-body">
                      <div className="preview-sidebar" />
                      <div className="preview-content" />
                    </div>
                  </div>
                  <div className="theme-info-row">
                    <span>Dark Mode (High Contrast)</span>
                    {theme === 'dark' && <FiCheck className="check-icon" />}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => dispatch(toggleTheme())}
                >
                  Toggle Theme ({theme === 'light' ? 'Switch to Dark' : 'Switch to Light'})
                </Button>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifs} className="settings-form">
              <div className="settings-section-header">
                <h3 className="section-title">Notification Channels & Alerts</h3>
                <p className="section-desc">Manage push alerts, email summaries, and triggers</p>
              </div>

              <div className="toggles-list">
                <div className="toggle-row">
                  <div>
                    <h4 className="toggle-title">Deal Pipeline Stage Updates</h4>
                    <p className="toggle-desc">
                      Notify me via email when an assigned deal advances to Won or Lost
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifSettings.emailDealUpdates}
                      onChange={() => handleNotifToggle('emailDealUpdates')}
                    />
                    <span className="slider round" />
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <h4 className="toggle-title">Task Due Date Reminders</h4>
                    <p className="toggle-desc">
                      Receive an alert 24 hours prior to a task deadline
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifSettings.emailTaskReminders}
                      onChange={() => handleNotifToggle('emailTaskReminders')}
                    />
                    <span className="slider round" />
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <h4 className="toggle-title">Browser Desktop Notifications</h4>
                    <p className="toggle-desc">
                      Receive immediate toast badges for critical customer tickets
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifSettings.browserAlerts}
                      onChange={() => handleNotifToggle('browserAlerts')}
                    />
                    <span className="slider round" />
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <h4 className="toggle-title">Weekly Executive Analytics Digest</h4>
                    <p className="toggle-desc">
                      Receive weekly Monday morning pipeline metrics in inbox
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifSettings.weeklyDigest}
                      onChange={() => handleNotifToggle('weeklyDigest')}
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>

              <div className="settings-submit-row">
                <Button type="submit" variant="primary" icon={FiSave}>
                  Update Notification Rules
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
