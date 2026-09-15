/**
 * customerSlice.js
 * Redux Toolkit slice for customer records, CRUD actions, and filters
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialCustomers } from '../../data/customers';

const initialState = {
  customers: initialCustomers,
  selectedCustomer: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'All',
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action) => {
      const newCustomer = {
        ...action.payload,
        id: action.payload.id || `cust-${Date.now()}`,
        createdDate: action.payload.createdDate || new Date().toISOString().split('T')[0],
      };
      state.customers.unshift(newCustomer);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...action.payload };
      }
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload.id) {
        state.selectedCustomer = { ...state.selectedCustomer, ...action.payload };
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter((c) => c.id !== action.payload);
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload) {
        state.selectedCustomer = null;
      }
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    setCustomerSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCustomerStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setCustomerLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCustomerError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  setCustomerSearchTerm,
  setCustomerStatusFilter,
  setCustomerLoading,
  setCustomerError,
} = customerSlice.actions;

export default customerSlice.reducer;
