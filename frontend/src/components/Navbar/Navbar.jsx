import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiMenu,
  FiMoon,
  FiSun,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiCheckCircle,
  FiSearch,
} from 'react-icons/fi';
import { toggleTheme, setMobileSidebarOpen } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { getInitials } from '../../utils/helpers';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { theme, mobileSidebarOpen } = useSelector((state) => state.ui);
  const tickets = useSelector((state) => state.tickets.tickets);
  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-left">
        <button
          className="navbar-toggle-btn"
          onClick={() => dispatch(setMobileSidebarOpen(!mobileSidebarOpen))}
          aria-label="Toggle navigation menu"
        >
          <FiMenu />
        </button>

        <div className="navbar-search">
          <FiSearch className="nav-search-icon" />
          <input
            type="text"
            placeholder="Search customers, leads, deals... (Ctrl + K)"
            className="nav-search-input"
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* Theme Toggle */}
        <button
          className="nav-icon-btn"
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>

        {/* Notifications Popover */}
        <div className="nav-popover-wrap" ref={notifRef}>
          <button
            className="nav-icon-btn notif-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
          >
            <FiBell />
            {openTicketsCount > 0 && (
              <span className="notif-badge">{openTicketsCount}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>Notifications</h4>
                <span className="badge badge-info">{openTicketsCount} new</span>
              </div>
              <div className="notif-list">
                <div className="notif-item unread">
                  <div className="notif-icon-wrap info">
                    <FiBell />
                  </div>
                  <div className="notif-content">
                    <p className="notif-text">
                      <strong>{openTicketsCount} tickets</strong> need immediate attention.
                    </p>
                    <span className="notif-time">Just now</span>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-icon-wrap success">
                    <FiCheckCircle />
                  </div>
                  <div className="notif-content">
                    <p className="notif-text">
                      Enterprise SLA contract signed by Apex Global.
                    </p>
                    <span className="notif-time">1 hour ago</span>
                  </div>
                </div>
              </div>
              <div className="notif-footer">
                <Link to="/tickets" onClick={() => setNotificationsOpen(false)}>
                  View all tickets
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="nav-profile-wrap" ref={dropdownRef}>
          <button
            className="nav-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="avatar avatar-sm">
              {getInitials(user?.name || 'User')}
            </div>
            <div className="nav-profile-info">
              <span className="nav-user-name">{user?.name || 'Alex Morgan'}</span>
              <span className="nav-user-role">{user?.role || 'Admin'}</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="nav-profile-dropdown">
              <div className="dropdown-user-header">
                <p className="user-full-name">{user?.name || 'Alex Morgan'}</p>
                <p className="user-email">{user?.email || 'alex.m@nexuscrm.com'}</p>
                <span className="badge badge-purple mt-1">{user?.role || 'Admin'}</span>
              </div>
              <div className="dropdown-divider" />
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <FiUser className="dropdown-icon" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <FiSettings className="dropdown-icon" />
                <span>Account Settings</span>
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <FiLogOut className="dropdown-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
