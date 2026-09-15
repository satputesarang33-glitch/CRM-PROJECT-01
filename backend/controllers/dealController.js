import { db, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";
import { createNotification, notifyAdmins } from "../services/notificationService.js";
import { sendDealWonEmail } from "../services/emailService.js";

/**
 * Deals Management Controller
 * Handles deals pipeline, stage progression, and close celebrations.
 */

/**
 * @desc   Get deals with filtering and pagination
 * @route  GET /api/deals
 * @access Private
 */
export const getDeals = async (req, res, next) => {
  try {
    const { stage, customerId, assignedSalesperson, limit = 10, cursor } = req.query;

    let query = db.collection("deals").orderBy("createdAt", "desc");

    if (stage) {
      query = query.where("stage", "==", stage);
    }

    if (customerId) {
      query = query.where("customerId", "==", customerId);
    }

    if (assignedSalesperson) {
      query = query.where("assignedSalesperson", "==", assignedSalesperson);
    }

    const result = await paginateQuery(query, db.collection("deals"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Deals retrieved successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get deal by ID
 * @route  GET /api/deals/:id
 * @access Private
 */
export const getDealById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("deals").doc(id).get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Deal not found.");
    }

    return successResponse(res, 200, "Deal fetched successfully", {
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new deal
 * @route  POST /api/deals
 * @access Private
 */
export const createDeal = async (req, res, next) => {
  try {
    const {
      dealName,
      customerId,
      value,
      stage = "New",
      probability = 20,
      expectedCloseDate = null,
      assignedSalesperson = "",
      notes = "",
    } = req.body;

    const timestamp = FieldValue.serverTimestamp();

    const dealData = {
      dealName,
      customerId,
      value: Number(value) || 0,
      stage,
      probability: Number(probability) || 0,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      assignedSalesperson: assignedSalesperson || req.user.uid,
      notes,
      createdBy: req.user.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await db.collection("deals").add(dealData);

    // Create tracking activity
    await db.collection("activities").add({
      type: "Note",
      subject: `New Deal Created: ${dealName}`,
      description: `Deal created with value $${dealData.value} in stage ${stage}.`,
      customerId,
      dealId: docRef.id,
      userId: req.user.uid,
      activityDate: new Date().toISOString(),
      createdAt: timestamp,
    });

    // Notify assigned salesperson
    if (assignedSalesperson && assignedSalesperson !== req.user.uid) {
      createNotification({
        userId: assignedSalesperson,
        type: "NEW_DEAL",
        title: "New Deal Assigned",
        message: `Deal "${dealName}" valued at $${dealData.value} assigned to you.`,
        relatedId: docRef.id,
      });
    }

    return successResponse(
      res,
      201,
      "Deal created successfully",
      { id: docRef.id, ...dealData }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update deal details
 * @route  PUT /api/deals/:id
 * @access Private
 */
export const updateDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dealRef = db.collection("deals").doc(id);
    const doc = await dealRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Deal not found.");
    }

    const updateFields = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updateFields.value !== undefined) {
      updateFields.value = Number(updateFields.value);
    }
    if (updateFields.probability !== undefined) {
      updateFields.probability = Number(updateFields.probability);
    }

    delete updateFields.id;
    delete updateFields.createdAt;
    delete updateFields.createdBy;

    await dealRef.update(updateFields);
    const updatedDoc = await dealRef.get();

    return successResponse(res, 200, "Deal updated successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update deal stage
 * @route  PATCH /api/deals/:id/stage
 * @access Private
 */
export const updateDealStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const dealRef = db.collection("deals").doc(id);
    const doc = await dealRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Deal not found.");
    }

    const dealData = doc.data();
    const timestamp = FieldValue.serverTimestamp();

    await dealRef.update({
      stage,
      updatedAt: timestamp,
    });

    // Activity log for stage progression
    await db.collection("activities").add({
      type: "Note",
      subject: `Deal Stage Changed: ${dealData.dealName}`,
      description: `Stage progressed from ${dealData.stage} to ${stage}.`,
      customerId: dealData.customerId,
      dealId: id,
      userId: req.user.uid,
      activityDate: new Date().toISOString(),
      createdAt: timestamp,
    });

    // If deal won, fire notifications and celebrations
    if (stage === "Won") {
      notifyAdmins({
        type: "DEAL_WON",
        title: "🎉 Deal Won!",
        message: `Deal "${dealData.dealName}" was closed as WON for $${dealData.value}!`,
        relatedId: id,
      });

      if (req.user.email) {
        sendDealWonEmail(req.user.email, dealData);
      }
    } else if (stage === "Lost") {
      notifyAdmins({
        type: "DEAL_LOST",
        title: "Deal Lost",
        message: `Deal "${dealData.dealName}" was marked as Lost.`,
        relatedId: id,
      });
    }

    return successResponse(res, 200, `Deal stage updated to ${stage}`, {
      id,
      previousStage: dealData.stage,
      newStage: stage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete deal
 * @route  DELETE /api/deals/:id
 * @access Private (Admin, Manager)
 */
export const deleteDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dealRef = db.collection("deals").doc(id);
    const doc = await dealRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Deal not found.");
    }

    await dealRef.delete();
    return successResponse(res, 200, "Deal deleted successfully.");
  } catch (error) {
    next(error);
  }
};
