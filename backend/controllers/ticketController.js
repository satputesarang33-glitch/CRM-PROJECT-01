import { db, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";
import { generateTicketId } from "../utils/generateTicketId.js";
import { createNotification } from "../services/notificationService.js";
import { sendTicketAssignedEmail } from "../services/emailService.js";

/**
 * Support Ticket Controller
 * Handles customer service tickets, assignments, status lifecycle, and alerts.
 */

/**
 * @desc   Get tickets with filters and pagination
 * @route  GET /api/tickets
 * @access Private
 */
export const getTickets = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      assignedAgent,
      customerId,
      limit = 10,
      cursor,
    } = req.query;

    let query = db.collection("tickets").orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (priority) {
      query = query.where("priority", "==", priority);
    }

    if (assignedAgent) {
      query = query.where("assignedAgent", "==", assignedAgent);
    }

    if (customerId) {
      query = query.where("customerId", "==", customerId);
    }

    const result = await paginateQuery(query, db.collection("tickets"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Tickets retrieved successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get ticket by ID
 * @route  GET /api/tickets/:id
 * @access Private
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("tickets").doc(id).get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Ticket not found.");
    }

    return successResponse(res, 200, "Ticket retrieved successfully", {
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new support ticket
 * @route  POST /api/tickets
 * @access Private
 */
export const createTicket = async (req, res, next) => {
  try {
    const {
      customerId,
      subject,
      description,
      priority = "Medium",
      assignedAgent = "",
    } = req.body;

    const formattedTicketId = generateTicketId();
    const timestamp = FieldValue.serverTimestamp();

    const ticketData = {
      ticketId: formattedTicketId,
      customerId,
      subject,
      description,
      priority,
      status: "Open",
      assignedAgent,
      createdBy: req.user.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await db.collection("tickets").add(ticketData);

    // If assigned upon creation, notify agent
    if (assignedAgent) {
      createNotification({
        userId: assignedAgent,
        type: "TICKET_ASSIGNED",
        title: `Ticket Assigned: ${formattedTicketId}`,
        message: `You were assigned ticket: "${subject}" (${priority} priority).`,
        relatedId: docRef.id,
      });

      sendTicketAssignedEmail(req.user.email, {
        ticketId: formattedTicketId,
        subject,
        priority,
        description,
      });
    }

    return successResponse(
      res,
      201,
      "Support ticket created successfully",
      { id: docRef.id, ...ticketData }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update ticket details
 * @route  PUT /api/tickets/:id
 * @access Private
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticketRef = db.collection("tickets").doc(id);
    const doc = await ticketRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Ticket not found.");
    }

    const updateFields = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    delete updateFields.id;
    delete updateFields.ticketId;
    delete updateFields.createdAt;
    delete updateFields.createdBy;

    await ticketRef.update(updateFields);
    const updatedDoc = await ticketRef.get();

    return successResponse(res, 200, "Ticket updated successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update ticket status
 * @route  PATCH /api/tickets/:id/status
 * @access Private
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticketRef = db.collection("tickets").doc(id);
    const doc = await ticketRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Ticket not found.");
    }

    await ticketRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return successResponse(res, 200, `Ticket status updated to ${status}`, {
      id,
      status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Assign ticket to agent
 * @route  PATCH /api/tickets/:id/assign
 * @access Private
 */
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedAgent } = req.body;

    const ticketRef = db.collection("tickets").doc(id);
    const doc = await ticketRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Ticket not found.");
    }

    const ticketData = doc.data();

    await ticketRef.update({
      assignedAgent,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create notification
    createNotification({
      userId: assignedAgent,
      type: "TICKET_ASSIGNED",
      title: `Ticket Assigned: ${ticketData.ticketId}`,
      message: `Support ticket "${ticketData.subject}" has been assigned to you.`,
      relatedId: id,
    });

    // Send email alert to agent
    sendTicketAssignedEmail(req.user.email, {
      ticketId: ticketData.ticketId,
      subject: ticketData.subject,
      priority: ticketData.priority,
      description: ticketData.description,
    });

    return successResponse(res, 200, "Ticket assigned successfully", {
      id,
      assignedAgent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete ticket
 * @route  DELETE /api/tickets/:id
 * @access Private (Admin, Manager)
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticketRef = db.collection("tickets").doc(id);
    const doc = await ticketRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Ticket not found.");
    }

    await ticketRef.delete();
    return successResponse(res, 200, "Ticket deleted successfully.");
  } catch (error) {
    next(error);
  }
};
