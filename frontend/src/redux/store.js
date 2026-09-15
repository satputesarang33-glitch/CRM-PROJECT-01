/**
 * store.js
 * Central Redux Toolkit store configuration combining all domain and UI slices
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import leadReducer from './slices/leadSlice';
import dealReducer from './slices/dealSlice';
import taskReducer from './slices/taskSlice';
import ticketReducer from './slices/ticketSlice';
import userReducer from './slices/userSlice';
import activityReducer from './slices/activitySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    leads: leadReducer,
    deals: dealReducer,
    tasks: taskReducer,
    tickets: ticketReducer,
    users: userReducer,
    activities: activityReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
