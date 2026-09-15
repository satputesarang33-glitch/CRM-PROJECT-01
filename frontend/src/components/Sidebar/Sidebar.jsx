import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid,
  FiUsers,
  FiTarget,
  FiDollarSign,
  FiCheckSquare,
  FiActivity,
  FiLifeBuoy,
  FiBarChart2,
  FiShield,
  FiSettings,
  FiUser,
  FiLogOut,
  FiX,
  FiBriefcase,
} from 'react-icons/fi';
import { setMobileSidebarOpen } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mobileSidebarOpen } = useSelector((state) => state.ui);
  const leads = useSelector((state) => state.leads.leads);
  const tasks = useSelector((state) => state.tasks.tasks);
  const tickets = useSelector((state) => state.tickets.tickets);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;

  const handleLinkClick = () => {
    dispatch(setMobileSidebarOpen(false));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setMobileSidebarOpen(false));
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/customers', label: 'Customers', icon: FiUsers },
    { to: '/leads', label: 'Leads', icon: FiTarget, badge: newLeadsCount },
    { to: '/deals', label: 'Deals', icon: FiDollarSign },
    { to: '/tasks', label: 'Tasks', icon: FiCheckSquare, badge: pendingTasksCount },
    { to: '/activities', label: 'Activities', icon: FiActivity },
    { to: '/tickets', label: 'Tickets', icon: FiLifeBuoy, badge: openTicketsCount },
    { to: '/reports', label: 'Reports', icon: FiBarChart2 },
    { to: '/users', label: 'Users', icon: FiShield },
  ];

  const bottomNavItems = [
    { to: '/settings', label: 'Settings', icon: FiSettings },
    { to: '/profile', label: 'Profile', icon: FiUser },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-aside ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <FiBriefcase />
          </div>
          <div className="brand-text">
            <span className="brand-title">Nexus<strong>CRM</strong></span>
            <span className="brand-badge">PRO</span>
          </div>
          <button
            className="sidebar-close-mobile"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-container">
          <div className="sidebar-section-title">MAIN MENU</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="nav-link-icon" />
                  <span className="nav-link-text">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="nav-link-badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="sidebar-section-title mt-4">PREFERENCES</div>
          <nav className="sidebar-nav">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="nav-link-icon" />
                  <span className="nav-link-text">{item.label}</span>
                </NavLink>
              );
            })}

            <button className="nav-link logout-link" onClick={handleLogout}>
              <FiLogOut className="nav-link-icon" />
              <span className="nav-link-text">Logout</span>
            </button>
          </nav>
        </div>

        {/* Support quick card footer */}
        <div className="sidebar-footer-card">
          <div className="footer-card-inner">
            <p className="footer-card-title">Need Assistance?</p>
            <p className="footer-card-desc">24/7 Priority support hotline</p>
            <a href="mailto:support@nexuscrm.com" className="footer-card-btn">
              Contact Support
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
