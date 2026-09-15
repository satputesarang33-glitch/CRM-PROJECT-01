import { db, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Task Management Controller
 * Handles task scheduling, delegation, and completion tracking.
 */

/**
 * @desc   Get all tasks with filters and pagination
 * @route  GET /api/tasks
 * @access Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      assignedUser,
      customerId,
      limit = 10,
      cursor,
    } = req.query;

    let query = db.collection("tasks").orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (priority) {
      query = query.where("priority", "==", priority);
    }

    if (assignedUser) {
      query = query.where("assignedUser", "==", assignedUser);
    }

    if (customerId) {
      query = query.where("customerId", "==", customerId);
    }

    const result = await paginateQuery(query, db.collection("tasks"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Tasks fetched successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get task by ID
 * @route  GET /api/tasks/:id
 * @access Private
 */
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("tasks").doc(id).get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Task not found.");
    }

    return successResponse(res, 200, "Task retrieved successfully", {
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new task
 * @route  POST /api/tasks
 * @access Private
 */
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description = "",
      assignedUser = "",
      customerId = "",
      priority = "Medium",
      status = "Pending",
      dueDate = null,
    } = req.body;

    const timestamp = FieldValue.serverTimestamp();

    const taskData = {
      title,
      description,
      assignedUser: assignedUser || req.user.uid,
      customerId,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await db.collection("tasks").add(taskData);

    // Notify assigned user
    if (assignedUser && assignedUser !== req.user.uid) {
      createNotification({
        userId: assignedUser,
        type: "TASK_DEADLINE",
        title: "New Task Assigned",
        message: `Task "${title}" assigned to you. Due: ${
          dueDate ? new Date(dueDate).toLocaleDateString() : "Flexible"
        }`,
        relatedId: docRef.id,
      });
    }

    return successResponse(
      res,
      201,
      "Task created successfully",
      { id: docRef.id, ...taskData }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update task
 * @route  PUT /api/tasks/:id
 * @access Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taskRef = db.collection("tasks").doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Task not found.");
    }

    const updateFields = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updateFields.dueDate) {
      updateFields.dueDate = new Date(updateFields.dueDate);
    }

    delete updateFields.id;
    delete updateFields.createdAt;
    delete updateFields.createdBy;

    await taskRef.update(updateFields);
    const updatedDoc = await taskRef.get();

    return successResponse(res, 200, "Task updated successfully", {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Complete task
 * @route  PATCH /api/tasks/:id/complete
 * @access Private
 */
export const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taskRef = db.collection("tasks").doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Task not found.");
    }

    const currentStatus = doc.data().status;
    const newStatus = currentStatus === "Completed" ? "In Progress" : "Completed";

    await taskRef.update({
      status: newStatus,
      completedAt: newStatus === "Completed" ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return successResponse(res, 200, `Task marked as ${newStatus}`, {
      id,
      status: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete task
 * @route  DELETE /api/tasks/:id
 * @access Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taskRef = db.collection("tasks").doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Task not found.");
    }

    await taskRef.delete();
    return successResponse(res, 200, "Task deleted successfully.");
  } catch (error) {
    next(error);
  }
};
