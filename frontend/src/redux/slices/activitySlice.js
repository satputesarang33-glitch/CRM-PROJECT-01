/**
 * activitySlice.js
 * Redux Toolkit slice for logging customer interactions and timeline activities
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialActivities } from '../../data/activities';

const initialState = {
  activities: initialActivities,
  typeFilter: 'All',
  searchTerm: '',
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setActivities: (state, action) => {
      state.activities = action.payload;
    },
    addActivity: (state, action) => {
      const today = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newActivity = {
        ...action.payload,
        id: action.payload.id || `act-${Date.now()}`,
        date: action.payload.date || today,
        time: action.payload.time || timeStr,
        period: 'Today',
      };
      state.activities.unshift(newActivity);
    },
    deleteActivity: (state, action) => {
      state.activities = state.activities.filter((a) => a.id !== action.payload);
    },
    setActivityTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
    },
    setActivitySearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
});

export const {
  setActivities,
  addActivity,
  deleteActivity,
  setActivityTypeFilter,
  setActivitySearchTerm,
} = activitySlice.actions;

export default activitySlice.reducer;
