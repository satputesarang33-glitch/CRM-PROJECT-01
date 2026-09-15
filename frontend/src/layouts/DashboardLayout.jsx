import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Toast from '../components/Toast/Toast';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-main-wrapper">
        <Navbar />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};

export default DashboardLayout;
