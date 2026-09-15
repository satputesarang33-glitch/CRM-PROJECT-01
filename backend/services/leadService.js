import { db, FieldValue } from "../config/firebase.js";
import { createNotification } from "./notificationService.js";

/**
 * Lead Service
 * Handles lead business operations including lead conversion workflows.
 */

/**
 * Convert a Lead into a Customer atomically
 * @param {string} leadId - Lead ID to convert
 * @param {string} currentUserId - User performing the conversion
 * @returns {Promise<{ customer: object, lead: object }>}
 */
export const convertLeadToCustomer = async (leadId, currentUserId) => {
  const leadRef = db.collection("leads").doc(leadId);
  const customerRef = db.collection("customers").doc();
  const activityRef = db.collection("activities").doc();

  return await db.runTransaction(async (transaction) => {
    const leadDoc = await transaction.get(leadRef);

    if (!leadDoc.exists) {
      throw new Error("Lead not found.");
    }

    const leadData = leadDoc.data();

    if (leadData.status === "Converted") {
      throw new Error("This lead has already been converted.");
    }

    // Split name if first and last name are in a single field
    const nameParts = (leadData.name || "").trim().split(" ");
    const firstName = nameParts[0] || "New";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const timestamp = FieldValue.serverTimestamp();

    // 1. Prepare Customer Document
    const customerPayload = {
      firstName,
      lastName,
      email: leadData.email || "",
      phone: leadData.phone || "",
      company: leadData.company || "",
      source: leadData.source || "Lead Conversion",
      status: "Customer",
      notes: leadData.notes || `Converted from lead: ${leadData.name || leadId}`,
      assignedEmployee: leadData.assignedUser || currentUserId,
      convertedFromLeadId: leadId,
      createdBy: currentUserId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 2. Prepare Lead Update
    const leadUpdatePayload = {
      status: "Converted",
      convertedCustomerId: customerRef.id,
      convertedAt: timestamp,
      convertedBy: currentUserId,
      updatedAt: timestamp,
    };

    // 3. Prepare Conversion Activity Document
    const activityPayload = {
      type: "Follow-up",
      subject: `Lead Converted: ${leadData.name}`,
      description: `Lead was converted into customer ${firstName} ${lastName} by user ${currentUserId}.`,
      customerId: customerRef.id,
      leadId,
      userId: currentUserId,
      activityDate: new Date().toISOString(),
      createdAt: timestamp,
    };

    // Commit writes in transaction
    transaction.set(customerRef, customerPayload);
    transaction.update(leadRef, leadUpdatePayload);
    transaction.set(activityRef, activityPayload);

    // Notify assigned user if distinct from current user
    if (leadData.assignedUser && leadData.assignedUser !== currentUserId) {
      createNotification({
        userId: leadData.assignedUser,
        type: "NEW_CUSTOMER",
        title: "Lead Converted to Customer",
        message: `Lead ${leadData.name} has been converted into a new Customer.`,
        relatedId: customerRef.id,
      });
    }

    return {
      customer: { id: customerRef.id, ...customerPayload },
      lead: { id: leadId, ...leadData, ...leadUpdatePayload },
    };
  });
};
