import { body, query } from "express-validator";

export const createLeadValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Lead name is required."),
  body("email")
    .isEmail()
    .withMessage("Valid lead email is required.")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim(),
  body("company")
    .optional()
    .trim(),
  body("source")
    .optional()
    .trim(),
  body("status")
    .optional()
    .isIn([
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Converted",
      "Lost",
    ])
    .withMessage("Invalid lead status."),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High."),
  body("expectedValue")
    .optional()
    .isNumeric()
    .withMessage("Expected value must be a number."),
  body("assignedUser")
    .optional()
    .trim(),
];

export const updateLeadValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty."),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),
  body("status")
    .optional()
    .isIn([
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Converted",
      "Lost",
    ])
    .withMessage("Invalid lead status."),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High."),
  body("expectedValue")
    .optional()
    .isNumeric()
    .withMessage("Expected value must be a number."),
];

export const leadQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("status")
    .optional()
    .isIn([
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Converted",
      "Lost",
    ])
    .withMessage("Invalid status filter."),
  query("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority filter."),
];
