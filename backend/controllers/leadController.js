import { db, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";
import { convertLeadToCustomer } from "../services/leadService.js";
import { createNotification } from "../services/notificationService.js";
import { sendLeadFollowUpEmail } from "../services/emailService.js";

/**
 * Lead Management Controller
 * Handles lead lifecycle from creation, assignment, progression to conversion.
 */

/**
 * @desc   Get all leads with filters and pagination
 * @route  GET /api/leads
 * @access Private
 */
export const getLeads = async (req, res, next) => {
  try {
    const { status, priority, assignedUser, source, limit = 10, cursor } = req.query;

    let query = db.collection("leads").orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (priority) {
      query = query.where("priority", "==", priority);
    }

    if (assignedUser) {
      query = query.where("assignedUser", "==", assignedUser);
    }

    if (source) {
      query = query.where("source", "==", source);
    }

    const result = await paginateQuery(query, db.collection("leads"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Leads fetched successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single lead by ID
 * @route  GET /api/leads/:id
 * @access Private
 */
export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("leads").doc(id).get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Lead not found.");
    }

    return successResponse(res, 200, "Lead fetched successfully", {
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new lead
 * @route  POST /api/leads
 * @access Private
 */
export const createLead = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone = "",
      company = "",
      source = "Website",
      status = "New",
      priority = "Medium",
      assignedUser = "",
      expectedValue = 0,
      notes = "",
    } = req.body;

    const timestamp = FieldValue.serverTimestamp();

    const leadData = {
      name,
      email,
      phone,
      company,
      source,
      status,
      priority,
      assignedUser: assignedUser || req.user.uid,
      expectedValue: Number(expectedValue) || 0,
      notes,
      createdBy: req.user.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await db.collection("leads").add(leadData);

    // Notification for assigned agent
    if (assignedUser && assignedUser !== req.user.uid) {
      createNotification({
        userId: assignedUser,
        type: "NEW_LEAD",
        title: "New Lead Assigned",
        message: `Lead ${name} (${company || "Individual"}) has been assigned to you.`,
        relatedId: docRef.id,
      });
    }

    // Optional follow-up notification email
    if (email) {
      sendLeadFollowUpEmail(email, { name, company, status });
    }

    return successResponse(
      res,
      201,
      "Lead created successfully",
      { id: docRef.id, ...leadData }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update lead
 * @route  PUT /api/leads/:id
 * @access Private
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leadRef = db.collection("leads").doc(id);
    const doc = await leadRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Lead not found.");
    }

    const updateFields = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updateFields.expectedValue !== undefined) {
      updateFields.expectedValue = Number(updateFields.expectedValue);
    }

    delete updateFields.id;
    delete updateFields.createdAt;
    delete updateFields.createdBy;

    await leadRef.update(updateFields);
    const updatedDoc = await leadRef.get();

    return successResponse(res, 200, "Lead updated successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete lead
 * @route  DELETE /api/leads/:id
 * @access Private (Admin, Manager)
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leadRef = db.collection("leads").doc(id);
    const doc = await leadRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Lead not found.");
    }

    await leadRef.delete();
    return successResponse(res, 200, "Lead deleted successfully.");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Convert Lead into Customer
 * @route  POST /api/leads/:id/convert
 * @access Private
 */
export const convertLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await convertLeadToCustomer(id, req.user.uid);

    return successResponse(
      res,
      200,
      "Lead converted into Customer successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};
