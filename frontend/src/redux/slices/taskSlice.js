/**
 * taskSlice.js
 * Redux Toolkit slice for task management, completion toggling, and priorities
 */

import { createSlice } from '@reduxjs/toolkit';
import { initialTasks } from '../../data/tasks';

const initialState = {
  tasks: initialTasks,
  isLoading: false,
  error: null,
  statusFilter: 'All',
  priorityFilter: 'All',
  searchTerm: '',
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    addTask: (state, action) => {
      const newTask = {
        ...action.payload,
        id: action.payload.id || `task-${Date.now()}`,
      };
      state.tasks.unshift(newTask);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    toggleTaskCompletion: (state, action) => {
      const taskId = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
      }
    },
    setTaskStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setTaskPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },
    setTaskSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setTaskLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTaskError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  setTaskSearchTerm,
  setTaskLoading,
  setTaskError,
} = taskSlice.actions;

export default taskSlice.reducer;
