import { body, query } from "express-validator";

export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required."),
  body("description")
    .optional()
    .trim(),
  body("assignedUser")
    .optional()
    .trim(),
  body("customerId")
    .optional()
    .trim(),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High."),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed."),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO8601 date string."),
];

export const updateTaskValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Task title cannot be empty."),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High."),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed."),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO8601 date string."),
];

export const taskQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100."),
  query("status")
    .optional()
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Invalid status filter."),
  query("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority filter."),
];
