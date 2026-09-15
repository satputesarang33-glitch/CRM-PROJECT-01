/**
 * helpers.js
 * Common utility functions for formatting, calculations, and badge classes
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatIndianCompact = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
  return `₹${amount}`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getInitials = (name = '') => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getStatusBadgeClass = (status = '') => {
  const s = status.toLowerCase();
  switch (s) {
    case 'active':
    case 'won':
    case 'converted':
    case 'completed':
    case 'qualified':
    case 'resolved':
      return 'badge-success';
    case 'in progress':
    case 'contacted':
    case 'proposal':
    case 'negotiation':
    case 'pending':
    case 'new':
      return 'badge-info';
    case 'open':
    case 'follow-up':
      return 'badge-warning';
    case 'lost':
    case 'inactive':
    case 'closed':
    case 'cancelled':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};

export const getPriorityBadgeClass = (priority = '') => {
  const p = priority.toLowerCase();
  switch (p) {
    case 'high':
    case 'urgent':
      return 'badge-danger';
    case 'medium':
      return 'badge-warning';
    case 'low':
      return 'badge-info';
    default:
      return 'badge-neutral';
  }
};

export const truncateText = (text = '', maxLength = 40) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
