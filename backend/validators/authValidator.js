import { body } from "express-validator";

export const syncUserValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("A valid email address is required.")
    .normalizeEmail(),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must not be empty if provided."),
  body("lastName")
    .optional()
    .trim(),
  body("role")
    .optional()
    .isIn(["Admin", "Manager", "Sales Agent", "Support Agent"])
    .withMessage("Role must be Admin, Manager, Sales Agent, or Support Agent."),
];

export const updateUserProfileValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty."),
  body("lastName")
    .optional()
    .trim(),
  body("phone")
    .optional()
    .trim(),
  body("profileImage")
    .optional()
    .isString(),
];
