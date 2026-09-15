/**
 * Date Utility Functions for CRM Reporting and Filtering
 */

/**
 * Calculates start and end Date objects based on timeframe identifier or custom from/to inputs.
 * @param {string} period - 'today' | 'week' | 'month' | 'year' | 'custom'
 * @param {string} [from] - ISO date string for custom start
 * @param {string} [to] - ISO date string for custom end
 * @returns {{ startDate: Date, endDate: Date }}
 */
export const getDateRange = (period = "month", from = null, to = null) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date(now.setHours(23, 59, 59, 999));

  switch (period.toLowerCase()) {
    case "today": {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "week": {
      // 7 days ago
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      // 30 days ago
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "year": {
      // 365 days ago
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "custom": {
      if (from) {
        startDate = new Date(from);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }
      if (to) {
        endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    }
    default: {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }
  }

  return { startDate, endDate };
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateKey = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};
