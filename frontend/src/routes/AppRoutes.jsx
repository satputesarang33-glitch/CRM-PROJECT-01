import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import ResetPassword from '../pages/ResetPassword/ResetPassword';

// Dashboard & App Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Customers from '../pages/Customers/Customers';
import CustomerDetails from '../pages/CustomerDetails/CustomerDetails';
import Leads from '../pages/Leads/Leads';
import Deals from '../pages/Deals/Deals';
import Tasks from '../pages/Tasks/Tasks';
import Activities from '../pages/Activities/Activities';
import Tickets from '../pages/Tickets/Tickets';
import Reports from '../pages/Reports/Reports';
import Users from '../pages/Users/Users';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected CRM Routes inside DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
