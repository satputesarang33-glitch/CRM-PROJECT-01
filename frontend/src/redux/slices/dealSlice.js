/**
 * dealSlice.js
 * Redux Toolkit slice for sales deals and Kanban pipeline stages
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialDeals } from '../../data/deals';

const initialState = {
  deals: initialDeals,
  isLoading: false,
  error: null,
  searchTerm: '',
};

const dealSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setDeals: (state, action) => {
      state.deals = action.payload;
    },
    addDeal: (state, action) => {
      const newDeal = {
        ...action.payload,
        id: action.payload.id || `deal-${Date.now()}`,
      };
      state.deals.unshift(newDeal);
    },
    updateDeal: (state, action) => {
      const index = state.deals.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.deals[index] = { ...state.deals[index], ...action.payload };
      }
    },
    deleteDeal: (state, action) => {
      state.deals = state.deals.filter((d) => d.id !== action.payload);
    },
    updateDealStage: (state, action) => {
      const { dealId, newStage } = action.payload;
      const deal = state.deals.find((d) => d.id === dealId);
      if (deal) {
        deal.stage = newStage;
        if (newStage === 'Won') deal.probability = 100;
        if (newStage === 'Lost') deal.probability = 0;
      }
    },
    setDealSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setDealLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDealError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDeals,
  addDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
  setDealSearchTerm,
  setDealLoading,
  setDealError,
} = dealSlice.actions;

export default dealSlice.reducer;
