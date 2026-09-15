/**
 * leadSlice.js
 * Redux Toolkit slice for lead pipeline, status changes, and conversion
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialLeads } from '../../data/leads';

const initialState = {
  leads: initialLeads,
  isLoading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'All',
  priorityFilter: 'All',
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
    },
    addLead: (state, action) => {
      const newLead = {
        ...action.payload,
        id: action.payload.id || `lead-${Date.now()}`,
        createdDate: action.payload.createdDate || new Date().toISOString().split('T')[0],
      };
      state.leads.unshift(newLead);
    },
    updateLead: (state, action) => {
      const index = state.leads.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = { ...state.leads[index], ...action.payload };
      }
    },
    deleteLead: (state, action) => {
      state.leads = state.leads.filter((l) => l.id !== action.payload);
    },
    convertLead: (state, action) => {
      const leadId = action.payload;
      const lead = state.leads.find((l) => l.id === leadId);
      if (lead) {
        lead.status = 'Converted';
      }
    },
    setLeadSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setLeadStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setLeadPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setLeadLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setLeadError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLeads,
  addLead,
  updateLead,
  deleteLead,
  convertLead,
  setLeadSearchTerm,
  setLeadStatusFilter,
  setLeadPriorityFilter,
  setLeadLoading,
  setLeadError,
} = leadSlice.actions;

export default leadSlice.reducer;
