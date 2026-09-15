import { db, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";
import { getCustomerFullDetails } from "../services/customerService.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Customer Management Controller
 * Handles customer CRUD, query filtering, and 360-degree aggregated details.
 */

/**
 * @desc   Get all customers with filters, pagination, and sorting
 * @route  GET /api/customers
 * @access Private
 */
export const getCustomers = async (req, res, next) => {
  try {
    const {
      status,
      assignedEmployee,
      source,
      company,
      limit = 10,
      cursor,
    } = req.query;

    let query = db.collection("customers").orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (assignedEmployee) {
      query = query.where("assignedEmployee", "==", assignedEmployee);
    }

    if (source) {
      query = query.where("source", "==", source);
    }

    if (company) {
      query = query.where("company", "==", company);
    }

    const result = await paginateQuery(query, db.collection("customers"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Customers fetched successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single customer by ID
 * @route  GET /api/customers/:id
 * @access Private
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("customers").doc(id).get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Customer not found.");
    }

    return successResponse(res, 200, "Customer retrieved successfully", {
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get comprehensive customer 360 view (customer, activities, deals, tasks, tickets)
 * @route  GET /api/customers/:id/details
 * @access Private
 */
export const getCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const details = await getCustomerFullDetails(id);

    if (!details) {
      return errorResponse(res, 404, "Customer not found.");
    }

    return successResponse(
      res,
      200,
      "Customer comprehensive details retrieved successfully",
      details
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new customer
 * @route  POST /api/customers
 * @access Private
 */
export const createCustomer = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone = "",
      company = "",
      jobTitle = "",
      address = "",
      city = "",
      state = "",
      country = "",
      website = "",
      source = "Direct",
      status = "Customer",
      notes = "",
      assignedEmployee = "",
    } = req.body;

    const timestamp = FieldValue.serverTimestamp();

    const customerData = {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      address,
      city,
      state,
      country,
      website,
      source,
      status,
      notes,
      assignedEmployee: assignedEmployee || req.user.uid,
      createdBy: req.user.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await db.collection("customers").add(customerData);

    // Notify assigned employee if different from creator
    if (assignedEmployee && assignedEmployee !== req.user.uid) {
      createNotification({
        userId: assignedEmployee,
        type: "NEW_CUSTOMER",
        title: "New Customer Assigned",
        message: `${firstName} ${lastName} from ${company || "individual"} has been assigned to you.`,
        relatedId: docRef.id,
      });
    }

    return successResponse(
      res,
      201,
      "Customer created successfully",
      { id: docRef.id, ...customerData }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update customer
 * @route  PUT /api/customers/:id
 * @access Private
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerRef = db.collection("customers").doc(id);
    const doc = await customerRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Customer not found.");
    }

    const updateFields = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    delete updateFields.id;
    delete updateFields.createdAt;
    delete updateFields.createdBy;

    await customerRef.update(updateFields);
    const updatedDoc = await customerRef.get();

    return successResponse(res, 200, "Customer updated successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete customer
 * @route  DELETE /api/customers/:id
 * @access Private (Admin, Manager)
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customerRef = db.collection("customers").doc(id);
    const doc = await customerRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Customer not found.");
    }

    await customerRef.delete();

    return successResponse(res, 200, "Customer deleted successfully.");
  } catch (error) {
    next(error);
  }
};
