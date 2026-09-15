import { db } from "../config/firebase.js";

/**
 * Dashboard Service
 * Calculates CRM analytics, pipeline metrics, and summary KPIs.
 */

/**
 * Get high-level CRM summary statistics
 */
export const getDashboardStats = async () => {
  const [
    customersSnap,
    leadsSnap,
    dealsSnap,
    tasksSnap,
    ticketsSnap,
  ] = await Promise.all([
    db.collection("customers").get(),
    db.collection("leads").get(),
    db.collection("deals").get(),
    db.collection("tasks").get(),
    db.collection("tickets").get(),
  ]);

  const totalCustomers = customersSnap.size;
  const totalLeads = leadsSnap.size;
  const totalDeals = dealsSnap.size;

  let totalRevenue = 0;
  dealsSnap.forEach((doc) => {
    const data = doc.data();
    if (data.stage === "Won" && data.value) {
      totalRevenue += Number(data.value) || 0;
    }
  });

  let pendingTasks = 0;
  tasksSnap.forEach((doc) => {
    const data = doc.data();
    if (data.status === "Pending" || data.status === "In Progress") {
      pendingTasks++;
    }
  });

  let openTickets = 0;
  ticketsSnap.forEach((doc) => {
    const data = doc.data();
    if (data.status === "Open" || data.status === "In Progress") {
      openTickets++;
    }
  });

  // Calculate new customers in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  let newCustomers = 0;
  customersSnap.forEach((doc) => {
    const createdAt = doc.data().createdAt;
    if (createdAt && createdAt.toDate && createdAt.toDate() >= thirtyDaysAgo) {
      newCustomers++;
    }
  });

  // Calculate Lead Conversion Rate
  let convertedLeads = 0;
  leadsSnap.forEach((doc) => {
    if (doc.data().status === "Converted") {
      convertedLeads++;
    }
  });
  const conversionRate =
    totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

  return {
    totalCustomers,
    totalLeads,
    totalDeals,
    totalRevenue,
    pendingTasks,
    openTickets,
    newCustomers,
    conversionRate,
  };
};

/**
 * Get deal pipeline breakdown by stage
 */
export const getPipelineMetrics = async () => {
  const dealsSnap = await db.collection("deals").get();

  const stages = {
    New: { count: 0, totalValue: 0 },
    Qualified: { count: 0, totalValue: 0 },
    Proposal: { count: 0, totalValue: 0 },
    Negotiation: { count: 0, totalValue: 0 },
    Won: { count: 0, totalValue: 0 },
    Lost: { count: 0, totalValue: 0 },
  };

  dealsSnap.forEach((doc) => {
    const data = doc.data();
    const stage = data.stage || "New";
    const val = Number(data.value) || 0;

    if (stages[stage]) {
      stages[stage].count += 1;
      stages[stage].totalValue += val;
    }
  });

  return stages;
};

/**
 * Get revenue trend data
 */
export const getRevenueAnalytics = async () => {
  const dealsSnap = await db
    .collection("deals")
    .where("stage", "==", "Won")
    .get();

  const monthlyMap = {};

  dealsSnap.forEach((doc) => {
    const data = doc.data();
    let dateObj;
    if (data.updatedAt && data.updatedAt.toDate) {
      dateObj = data.updatedAt.toDate();
    } else if (data.createdAt && data.createdAt.toDate) {
      dateObj = data.createdAt.toDate();
    } else {
      dateObj = new Date();
    }

    const monthKey = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}`;

    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + (Number(data.value) || 0);
  });

  const timeline = Object.keys(monthlyMap)
    .sort()
    .map((month) => ({
      month,
      revenue: monthlyMap[month],
    }));

  return { timeline };
};

/**
 * Get lead breakdown by status and source
 */
export const getLeadAnalytics = async () => {
  const leadsSnap = await db.collection("leads").get();

  const byStatus = {};
  const bySource = {};

  leadsSnap.forEach((doc) => {
    const data = doc.data();
    const status = data.status || "New";
    const source = data.source || "Unknown";

    byStatus[status] = (byStatus[status] || 0) + 1;
    bySource[source] = (bySource[source] || 0) + 1;
  });

  return { byStatus, bySource };
};

/**
 * Get customer acquisition distribution
 */
export const getCustomerAnalytics = async () => {
  const customersSnap = await db.collection("customers").get();

  const bySource = {};
  const byStatus = {};

  customersSnap.forEach((doc) => {
    const data = doc.data();
    const source = data.source || "Direct";
    const status = data.status || "Customer";

    bySource[source] = (bySource[source] || 0) + 1;
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return { bySource, byStatus };
};
