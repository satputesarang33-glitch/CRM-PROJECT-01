import { db } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";

/**
 * Notification Controller
 * Manages fetching, marking read, and deleting notifications for the authenticated user.
 */

/**
 * @desc   Get user notifications
 * @route  GET /api/notifications
 * @access Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20, cursor } = req.query;

    let query = db
      .collection("notifications")
      .where("userId", "in", [req.user.uid, "ALL"]);

    if (unreadOnly === "true") {
      query = query.where("isRead", "==", false);
    }

    try {
      const orderedQuery = query.orderBy("createdAt", "desc");
      const result = await paginateQuery(orderedQuery, db.collection("notifications"), {
        limit,
        cursor,
      });

      return successResponse(
        res,
        200,
        "Notifications fetched successfully",
        result.data,
        result.pagination
      );
    } catch (queryErr) {
      if (queryErr.message?.includes("requires an index") || queryErr.code === 9) {
        console.warn("⚠️ Firestore index missing for notifications, sorting in memory fallback.");
        const snapshot = await query.limit(Number(limit) || 20).get();
        const notifications = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const timeA = a.createdAt?._seconds || new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?._seconds || new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

        return successResponse(
          res,
          200,
          "Notifications fetched successfully",
          notifications,
          { total: notifications.length, limit: Number(limit) || 20, hasMore: false }
        );
      }
      throw queryErr;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Mark notification as read
 * @route  PATCH /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifRef = db.collection("notifications").doc(id);
    const doc = await notifRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Notification not found.");
    }

    const data = doc.data();
    if (data.userId !== req.user.uid && data.userId !== "ALL") {
      return errorResponse(res, 403, "Not authorized to modify this notification.");
    }

    await notifRef.update({ isRead: true });

    return successResponse(res, 200, "Notification marked as read.", {
      id,
      isRead: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Mark all notifications as read for current user
 * @route  PATCH /api/notifications/read-all
 * @access Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", req.user.uid)
      .where("isRead", "==", false)
      .get();

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();

    return successResponse(
      res,
      200,
      `Marked ${snapshot.size} notifications as read.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete notification
 * @route  DELETE /api/notifications/:id
 * @access Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifRef = db.collection("notifications").doc(id);
    const doc = await notifRef.get();

    if (!doc.exists) {
      return errorResponse(res, 404, "Notification not found.");
    }

    const data = doc.data();
    if (data.userId !== req.user.uid && req.user.role !== "Admin") {
      return errorResponse(res, 403, "Not authorized to delete this notification.");
    }

    await notifRef.delete();
    return successResponse(res, 200, "Notification deleted successfully.");
  } catch (error) {
    next(error);
  }
};
