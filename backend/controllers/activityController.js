import { db, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";

/**
 * Activity Management Controller
 * Logs and retrieves team touchpoints: Calls, Emails, Meetings, Notes, and Follow-ups.
 */

/**
 * @desc   Get activities with filtering and pagination
 * @route  GET /api/activities
 * @access Private
 */
export const getActivities = async (req, res, next) => {
  try {
    const {
      customerId,
      userId,
      leadId,
      dealId,
      type,
      limit = 20,
      cursor,
    } = req.query;

    let query = db.collection("activities").orderBy("createdAt", "desc");

    if (customerId) {
      query = query.where("customerId", "==", customerId);
    }

    if (userId) {
      query = query.where("userId", "==", userId);
    }

    if (leadId) {
      query = query.where("leadId", "==", leadId);
    }

    if (dealId) {
      query = query.where("dealId", "==", dealId);
    }

    if (type) {
      query = query.where("type", "==", type);
    }

    const result = await paginateQuery(query, db.collection("activities"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Activities fetched successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get activity by ID
 * @route  GET /api/activities/:id
 * @access Private
 */
export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("activities").doc(id).get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Activity not found.");
    }

    return successResponse(res, 200, "Activity retrieved successfully", {
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log new activity
 * @route  POST /api/activities
 * @access Private
 */
export const createActivity = async (req, res, next) => {
  try {
    const {
      type = "Note",
      subject,
      description = "",
      customerId = "",
      leadId = "",
      dealId = "",
      activityDate = null,
    } = req.body;

    if (!subject) {
      return errorResponse(res, 400, "Activity subject is required.");
    }

    const allowedTypes = ["Call", "Email", "Meeting", "Note", "Follow-up"];
    if (!allowedTypes.includes(type)) {
      return errorResponse(
        res,
        400,
        `Activity type must be one of: ${allowedTypes.join(", ")}`
      );
    }

    const timestamp = FieldValue.serverTimestamp();

    const activityData = {
      type,
      subject,
      description,
      customerId,
      leadId,
      dealId,
      userId: req.user.uid,
      activityDate: activityDate || new Date().toISOString(),
      createdAt: timestamp,
    };

    const docRef = await db.collection("activities").add(activityData);

    return successResponse(
      res,
      201,
      "Activity logged successfully",
      { id: docRef.id, ...activityData }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update activity
 * @route  PUT /api/activities/:id
 * @access Private
 */
export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activityRef = db.collection("activities").doc(id);
    const doc = await activityRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Activity not found.");
    }

    const { type, subject, description, activityDate } = req.body;
    const updateData = {};

    if (type) updateData.type = type;
    if (subject) updateData.subject = subject;
    if (description !== undefined) updateData.description = description;
    if (activityDate) updateData.activityDate = activityDate;

    await activityRef.update(updateData);
    const updatedDoc = await activityRef.get();

    return successResponse(res, 200, "Activity updated successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete activity
 * @route  DELETE /api/activities/:id
 * @access Private
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activityRef = db.collection("activities").doc(id);
    const doc = await activityRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Activity not found.");
    }

    await activityRef.delete();
    return successResponse(res, 200, "Activity deleted successfully.");
  } catch (error) {
    next(error);
  }
};
