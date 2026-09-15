import {
  getDashboardStats,
  getPipelineMetrics,
  getRevenueAnalytics,
  getLeadAnalytics,
  getCustomerAnalytics,
} from "../services/dashboardService.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Dashboard Analytics Controller
 * Serves real-time KPI metrics and dashboard charts.
 */

export const getStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    return successResponse(res, 200, "Dashboard statistics retrieved", stats);
  } catch (error) {
    next(error);
  }
};

export const getPipeline = async (req, res, next) => {
  try {
    const pipeline = await getPipelineMetrics();
    return successResponse(res, 200, "Deal pipeline metrics retrieved", pipeline);
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const revenue = await getRevenueAnalytics();
    return successResponse(res, 200, "Revenue trends retrieved", revenue);
  } catch (error) {
    next(error);
  }
};

export const getLeadsSummary = async (req, res, next) => {
  try {
    const leads = await getLeadAnalytics();
    return successResponse(res, 200, "Lead analytics retrieved", leads);
  } catch (error) {
    next(error);
  }
};

export const getCustomersSummary = async (req, res, next) => {
  try {
    const customers = await getCustomerAnalytics();
    return successResponse(res, 200, "Customer analytics retrieved", customers);
  } catch (error) {
    next(error);
  }
};
