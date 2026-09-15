import { db } from "../config/firebase.js";
import { getDateRange } from "../utils/dateUtils.js";

/**
 * Report Service
 * Compiles filtered analytics reports over customizable time periods.
 */

/**
 * Filter documents by timestamp field within date range
 */
const isWithinRange = (timestamp, startDate, endDate) => {
  if (!timestamp) return false;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date >= startDate && date <= endDate;
};

/**
 * Sales Report
 */
export const getSalesReport = async (period, from, to) => {
  const { startDate, endDate } = getDateRange(period, from, to);
  const dealsSnap = await db.collection("deals").get();

  let totalDeals = 0;
  let wonDeals = 0;
  let wonRevenue = 0;
  let lostDeals = 0;

  dealsSnap.forEach((doc) => {
    const data = doc.data();
    if (isWithinRange(data.createdAt, startDate, endDate)) {
      totalDeals++;
      if (data.stage === "Won") {
        wonDeals++;
        wonRevenue += Number(data.value) || 0;
      } else if (data.stage === "Lost") {
        lostDeals++;
      }
    }
  });

  const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;

  return {
    period,
    startDate,
    endDate,
    summary: {
      totalDeals,
      wonDeals,
      lostDeals,
      wonRevenue,
      winRate: `${winRate}%`,
    },
  };
};

/**
 * Revenue Report
 */
export const getRevenueReport = async (period, from, to) => {
  const { startDate, endDate } = getDateRange(period, from, to);
  const dealsSnap = await db.collection("deals").where("stage", "==", "Won").get();

  let totalRevenue = 0;
  const breakdownByDate = {};

  dealsSnap.forEach((doc) => {
    const data = doc.data();
    const dateField = data.updatedAt || data.createdAt;
    if (isWithinRange(dateField, startDate, endDate)) {
      const val = Number(data.value) || 0;
      totalRevenue += val;

      const dateObj = dateField.toDate ? dateField.toDate() : new Date(dateField);
      const dateKey = dateObj.toISOString().split("T")[0];
      breakdownByDate[dateKey] = (breakdownByDate[dateKey] || 0) + val;
    }
  });

  return {
    period,
    startDate,
    endDate,
    totalRevenue,
    dailyBreakdown: breakdownByDate,
  };
};

/**
 * Customer Growth Report
 */
export const getCustomersReport = async (period, from, to) => {
  const { startDate, endDate } = getDateRange(period, from, to);
  const customersSnap = await db.collection("customers").get();

  let newCustomers = 0;
  const byStatus = {};

  customersSnap.forEach((doc) => {
    const data = doc.data();
    if (isWithinRange(data.createdAt, startDate, endDate)) {
      newCustomers++;
      const status = data.status || "Customer";
      byStatus[status] = (byStatus[status] || 0) + 1;
    }
  });

  return {
    period,
    startDate,
    endDate,
    totalNewCustomers: newCustomers,
    breakdownByStatus: byStatus,
  };
};

/**
 * Lead Acquisition Report
 */
export const getLeadsReport = async (period, from, to) => {
  const { startDate, endDate } = getDateRange(period, from, to);
  const leadsSnap = await db.collection("leads").get();

  let totalNewLeads = 0;
  let convertedLeads = 0;
  const bySource = {};

  leadsSnap.forEach((doc) => {
    const data = doc.data();
    if (isWithinRange(data.createdAt, startDate, endDate)) {
      totalNewLeads++;
      if (data.status === "Converted") {
        convertedLeads++;
      }
      const source = data.source || "Direct";
      bySource[source] = (bySource[source] || 0) + 1;
    }
  });

  return {
    period,
    startDate,
    endDate,
    totalNewLeads,
    convertedLeads,
    bySource,
  };
};

/**
 * Employee Performance Report
 */
export const getEmployeesReport = async (period, from, to) => {
  const { startDate, endDate } = getDateRange(period, from, to);
  const [dealsSnap, tasksSnap, ticketsSnap, usersSnap] = await Promise.all([
    db.collection("deals").get(),
    db.collection("tasks").get(),
    db.collection("tickets").get(),
    db.collection("users").get(),
  ]);

  const employeeMap = {};

  usersSnap.forEach((doc) => {
    const user = doc.data();
    employeeMap[doc.id] = {
      userId: doc.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      role: user.role,
      dealsWon: 0,
      revenueGenerated: 0,
      tasksCompleted: 0,
      ticketsResolved: 0,
    };
  });

  dealsSnap.forEach((doc) => {
    const deal = doc.data();
    if (isWithinRange(deal.createdAt, startDate, endDate)) {
      const rep = deal.assignedSalesperson;
      if (rep && employeeMap[rep] && deal.stage === "Won") {
        employeeMap[rep].dealsWon++;
        employeeMap[rep].revenueGenerated += Number(deal.value) || 0;
      }
    }
  });

  tasksSnap.forEach((doc) => {
    const task = doc.data();
    if (isWithinRange(task.updatedAt || task.createdAt, startDate, endDate)) {
      const assignee = task.assignedUser;
      if (assignee && employeeMap[assignee] && task.status === "Completed") {
        employeeMap[assignee].tasksCompleted++;
      }
    }
  });

  ticketsSnap.forEach((doc) => {
    const ticket = doc.data();
    if (isWithinRange(ticket.updatedAt || ticket.createdAt, startDate, endDate)) {
      const agent = ticket.assignedAgent;
      if (agent && employeeMap[agent] && ticket.status === "Resolved") {
        employeeMap[agent].ticketsResolved++;
      }
    }
  });

  return {
    period,
    startDate,
    endDate,
    employees: Object.values(employeeMap),
  };
};

/**
 * Conversion Funnel Report
 */
export const getConversionReport = async (period, from, to) => {
  const { startDate, endDate } = getDateRange(period, from, to);
  const leadsSnap = await db.collection("leads").get();

  let total = 0;
  let converted = 0;
  let contacted = 0;
  let qualified = 0;

  leadsSnap.forEach((doc) => {
    const data = doc.data();
    if (isWithinRange(data.createdAt, startDate, endDate)) {
      total++;
      if (data.status === "Contacted") contacted++;
      if (data.status === "Qualified") qualified++;
      if (data.status === "Converted") converted++;
    }
  });

  const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

  return {
    period,
    startDate,
    endDate,
    funnel: {
      totalLeads: total,
      contacted,
      qualified,
      converted,
      overallConversionRate: `${rate}%`,
    },
  };
};
