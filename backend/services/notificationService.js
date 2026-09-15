import { db, FieldValue } from "../config/firebase.js";

/**
 * Notification Service
 * Handles dispatching in-app alerts to users in Cloud Firestore.
 */

/**
 * Create a new notification for a specific user or group
 * @param {object} params
 * @param {string} params.userId - Target user ID (or 'ALL')
 * @param {string} params.type - Notification type enum
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message content
 * @param {string} [params.relatedId] - Related document ID (deal, ticket, customer)
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    const notificationData = {
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("notifications").add(notificationData);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error("Failed to persist notification:", error.message);
    return null;
  }
};

/**
 * Notify all admins/managers about critical events
 */
export const notifyAdmins = async ({ type, title, message, relatedId = null }) => {
  try {
    const adminSnapshot = await db
      .collection("users")
      .where("role", "in", ["Admin", "Manager"])
      .get();

    const notifications = [];
    adminSnapshot.forEach((doc) => {
      notifications.push(
        createNotification({
          userId: doc.id,
          type,
          title,
          message,
          relatedId,
        })
      );
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Failed to notify admins:", error.message);
  }
};
