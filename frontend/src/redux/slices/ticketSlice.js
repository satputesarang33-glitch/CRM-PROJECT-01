/**
 * ticketSlice.js
 * Redux Toolkit slice for customer support tickets
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialTickets } from '../../data/tickets';

const initialState = {
  tickets: initialTickets,
  isLoading: false,
  error: null,
  statusFilter: 'All',
  priorityFilter: 'All',
  searchTerm: '',
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action) => {
      state.tickets = action.payload;
    },
    addTicket: (state, action) => {
      const today = new Date().toISOString().split('T')[0];
      const newTicket = {
        ...action.payload,
        id: action.payload.id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        createdDate: today,
        updatedDate: today,
      };
      state.tickets.unshift(newTicket);
    },
    updateTicket: (state, action) => {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = {
          ...state.tickets[index],
          ...action.payload,
          updatedDate: new Date().toISOString().split('T')[0],
        };
      }
    },
    deleteTicket: (state, action) => {
      state.tickets = state.tickets.filter((t) => t.id !== action.payload);
    },
    setTicketStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setTicketPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setTicketSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setTicketLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTicketError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTickets,
  addTicket,
  updateTicket,
  deleteTicket,
  setTicketStatusFilter,
  setTicketPriorityFilter,
  setTicketSearchTerm,
  setTicketLoading,
  setTicketError,
} = ticketSlice.actions;

export default ticketSlice.reducer;
