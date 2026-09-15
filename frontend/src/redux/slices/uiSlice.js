/**
 * uiSlice.js
 * Redux Toolkit slice for global UI states, Toast notifications, and theme settings
 */

import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('crm_theme') || 'light';

const initialState = {
  theme: savedTheme,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('crm_theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('crm_theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
    addToast: (state, action) => {
      const id = action.payload.id || `toast-${Date.now()}-${Math.random()}`;
      state.toasts.push({
        id,
        message: action.payload.message || 'Notification',
        type: action.payload.type || 'info', // 'success' | 'error' | 'info' | 'warning'
        duration: action.payload.duration || 4000,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setMobileSidebarOpen,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
