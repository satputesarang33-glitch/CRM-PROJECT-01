import { body, query } from "express-validator";

export const createTicketValidator = [
  body("customerId")
    .trim()
    .notEmpty()
    .withMessage("Customer ID is required."),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required."),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High."),
  body("assignedAgent")
    .optional()
    .trim(),
];

export const updateTicketValidator = [
  body("subject")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Subject cannot be empty."),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty."),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High."),
  body("status")
    .optional()
    .isIn(["Open", "In Progress", "Resolved", "Closed"])
    .withMessage("Status must be Open, In Progress, Resolved, or Closed."),
];

export const updateTicketStatusValidator = [
  body("status")
    .isIn(["Open", "In Progress", "Resolved", "Closed"])
    .withMessage("Status must be Open, In Progress, Resolved, or Closed."),
];

export const assignTicketValidator = [
  body("assignedAgent")
    .trim()
    .notEmpty()
    .withMessage("Assigned agent user ID or email is required."),
];

export const ticketQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("status")
    .optional()
    .isIn(["Open", "In Progress", "Resolved", "Closed"])
    .withMessage("Invalid status filter."),
  query("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority filter."),
];
