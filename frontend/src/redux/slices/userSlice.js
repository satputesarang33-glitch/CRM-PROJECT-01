/**
 * userSlice.js
 * Redux Toolkit slice for team members and role management
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialUsers } from '../../data/users';

const initialState = {
  users: initialUsers,
  isLoading: false,
  error: null,
  roleFilter: 'All',
  searchTerm: '',
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    addUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: action.payload.id || `user-${Date.now()}`,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      state.users.unshift(newUser);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    setUserRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
    setUserSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setUserRoleFilter,
  setUserSearchTerm,
} = userSlice.actions;

export default userSlice.reducer;
