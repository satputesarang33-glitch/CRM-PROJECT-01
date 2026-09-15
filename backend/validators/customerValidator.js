import { body, query } from "express-validator";

export const createCustomerValidator = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),
  body("email")
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim(),
  body("company")
    .optional()
    .trim(),
  body("jobTitle")
    .optional()
    .trim(),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Prospect", "Customer"])
    .withMessage("Status must be Active, Inactive, Prospect, or Customer."),
  body("source")
    .optional()
    .trim(),
  body("assignedEmployee")
    .optional()
    .trim(),
  body("notes")
    .optional()
    .trim(),
];

export const updateCustomerValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty."),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty."),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email.")
    .normalizeEmail(),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Prospect", "Customer"])
    .withMessage("Status must be Active, Inactive, Prospect, or Customer."),
];

export const customerQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("status")
    .optional()
    .isIn(["Active", "Inactive", "Prospect", "Customer"])
    .withMessage("Invalid status filter."),
];
