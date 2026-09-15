import { body, query } from "express-validator";

export const createDealValidator = [
  body("dealName")
    .trim()
    .notEmpty()
    .withMessage("Deal name is required."),
  body("customerId")
    .trim()
    .notEmpty()
    .withMessage("Customer ID is required."),
  body("value")
    .isNumeric()
    .withMessage("Deal value must be a valid number."),
  body("stage")
    .optional()
    .isIn(["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"])
    .withMessage("Invalid deal stage."),
  body("probability")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Probability must be an integer between 0 and 100."),
  body("expectedCloseDate")
    .optional()
    .isISO8601()
    .withMessage("Expected close date must be a valid ISO8601 date string."),
  body("assignedSalesperson")
    .optional()
    .trim(),
];

export const updateDealValidator = [
  body("dealName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Deal name cannot be empty."),
  body("value")
    .optional()
    .isNumeric()
    .withMessage("Value must be numeric."),
  body("stage")
    .optional()
    .isIn(["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"])
    .withMessage("Invalid deal stage."),
  body("probability")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Probability must be between 0 and 100."),
];

export const updateDealStageValidator = [
  body("stage")
    .isIn(["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"])
    .withMessage("Valid stage is required (New, Qualified, Proposal, Negotiation, Won, Lost)."),
];

export const dealQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("stage")
    .optional()
    .isIn(["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"])
    .withMessage("Invalid stage filter."),
];
