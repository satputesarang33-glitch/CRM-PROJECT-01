/**
 * authSlice.js
 * Redux Toolkit slice for authentication state, mock session, and user profile
 */

import { createSlice } from '@reduxjs/toolkit';

const defaultMockUser = {
  id: 'user-1',
  firstName: 'Alex',
  lastName: 'Morgan',
  name: 'Alex Morgan',
  email: 'alex.morgan@nexuscrm.com',
  role: 'Admin',
  phone: '+1 (555) 234-5678',
  avatar: '',
  department: 'Executive Management',
};

// Check if a saved session exists in localStorage
const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : defaultMockUser,
  token: savedToken || 'mock-jwt-token-xyz-12345',
  isAuthenticated: true, // Default to true for instant frontend exploration
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerSuccess,
  logout,
  updateProfile,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
