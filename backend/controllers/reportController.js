import {
  getSalesReport,
  getRevenueReport,
  getCustomersReport,
  getLeadsReport,
  getEmployeesReport,
  getConversionReport,
} from "../services/reportService.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Reports Controller
 * Serves in-depth business performance reports with configurable date filtering.
 */

export const getSales = async (req, res, next) => {
  try {
    const { period = "month", from, to } = req.query;
    const report = await getSalesReport(period, from, to);
    return successResponse(res, 200, "Sales report generated", report);
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const { period = "month", from, to } = req.query;
    const report = await getRevenueReport(period, from, to);
    return successResponse(res, 200, "Revenue report generated", report);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const { period = "month", from, to } = req.query;
    const report = await getCustomersReport(period, from, to);
    return successResponse(res, 200, "Customer growth report generated", report);
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req, res, next) => {
  try {
    const { period = "month", from, to } = req.query;
    const report = await getLeadsReport(period, from, to);
    return successResponse(res, 200, "Lead acquisition report generated", report);
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const { period = "month", from, to } = req.query;
    const report = await getEmployeesReport(period, from, to);
    return successResponse(res, 200, "Employee performance report generated", report);
  } catch (error) {
    next(error);
  }
};

export const getConversion = async (req, res, next) => {
  try {
    const { period = "month", from, to } = req.query;
    const report = await getConversionReport(period, from, to);
    return successResponse(res, 200, "Conversion funnel report generated", report);
  } catch (error) {
    next(error);
  }
};
