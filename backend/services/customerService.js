import { db } from "../config/firebase.js";

/**
 * Customer Service
 * Handles complex multi-collection aggregations for customer profiles.
 */

/**
 * Retrieve comprehensive details for a customer including related records
 * @param {string} customerId
 * @returns {Promise<object|null>}
 */
export const getCustomerFullDetails = async (customerId) => {
  const customerDoc = await db.collection("customers").doc(customerId).get();

  if (!customerDoc.exists) {
    return null;
  }

  const customerData = { id: customerDoc.id, ...customerDoc.data() };

  // Run parallel queries across related collections
  const [activitiesSnap, dealsSnap, tasksSnap, ticketsSnap] = await Promise.all([
    db.collection("activities").where("customerId", "==", customerId).limit(50).get(),
    db.collection("deals").where("customerId", "==", customerId).limit(50).get(),
    db.collection("tasks").where("customerId", "==", customerId).limit(50).get(),
    db.collection("tickets").where("customerId", "==", customerId).limit(50).get(),
  ]);

  const activities = activitiesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const deals = dealsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const tasks = tasksSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const tickets = ticketsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    customer: customerData,
    activities,
    deals,
    tasks,
    tickets,
  };
};
