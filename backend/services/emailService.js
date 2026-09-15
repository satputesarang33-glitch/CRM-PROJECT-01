import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

const defaultFrom =
  process.env.MAIL_FROM || "CRM Notifications <onboarding@resend.dev>";

/**
 * Generic email delivery helper
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!resendClient) {
    console.log(
      `📧 [Email Simulated] To: ${to} | Subject: "${subject}" | (RESEND_API_KEY not configured)`
    );
    return { success: true, simulated: true };
  }

  try {
    const data = await resendClient.emails.send({
      from: defaultFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || subject,
    });
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome Email to newly registered user
 */
export const sendWelcomeEmail = async (email, firstName = "User") => {
  return sendEmail({
    to: email,
    subject: "Welcome to CRM System!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Welcome to our CRM platform, ${firstName}!</h2>
        <p>Your account has been successfully configured. You can now access leads, deals, customers, and team activities.</p>
        <p>Best regards,<br/>The CRM Team</p>
      </div>
    `,
  });
};

/**
 * Send Password Reset link notification
 */
export const sendPasswordResetEmail = async (email, resetLink) => {
  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Instructions</h2>
        <p>You requested a password reset for your CRM account. Click the link below to set a new password:</p>
        <p><a href="${resetLink}" style="display:inline-block; padding: 10px 20px; background-color:#2563eb; color: #fff; text-decoration:none; border-radius: 5px;">Reset Password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send Lead Follow-up notification
 */
export const sendLeadFollowUpEmail = async (email, leadData) => {
  return sendEmail({
    to: email,
    subject: `Follow-up on Lead: ${leadData.name || "Inquiry"}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>Lead Follow-up Notification</h3>
        <p>Hello,</p>
        <p>This is a follow-up regarding your recent interest in our services.</p>
        <p><strong>Company:</strong> ${leadData.company || "N/A"}</p>
        <p><strong>Status:</strong> ${leadData.status || "New"}</p>
      </div>
    `,
  });
};

/**
 * Send Customer Notification
 */
export const sendCustomerNotification = async (email, customerData, title, message) => {
  return sendEmail({
    to: email,
    subject: title || "CRM Update Notice",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>${title}</h3>
        <p>${message}</p>
        <hr style="border:0; border-top:1px solid #eee; margin: 15px 0;"/>
        <small style="color: #888;">CRM Notification for ${customerData.firstName || "Customer"}</small>
      </div>
    `,
  });
};

/**
 * Send Ticket Assignment Email to Agent
 */
export const sendTicketAssignedEmail = async (email, ticketData) => {
  return sendEmail({
    to: email,
    subject: `[${ticketData.ticketId}] Support Ticket Assigned`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3>You have been assigned a Support Ticket</h3>
        <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
        <p><strong>Subject:</strong> ${ticketData.subject}</p>
        <p><strong>Priority:</strong> ${ticketData.priority}</p>
        <p><strong>Description:</strong> ${ticketData.description}</p>
      </div>
    `,
  });
};

/**
 * Send Deal Won Notification to Sales Team
 */
export const sendDealWonEmail = async (email, dealData) => {
  return sendEmail({
    to: email,
    subject: `🎉 Deal Won: ${dealData.dealName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #16a34a;">Congratulations! Deal Closed as Won</h2>
        <p><strong>Deal:</strong> ${dealData.dealName}</p>
        <p><strong>Value:</strong> $${Number(dealData.value || 0).toLocaleString()}</p>
        <p>Great job closing this opportunity!</p>
      </div>
    `,
  });
};
