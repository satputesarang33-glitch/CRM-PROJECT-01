import { validationResult } from "express-validator";
import { errorResponse } from "../utils/apiResponse.js";

/**
 * Validation Middleware
 * Checks express-validator results and returns a standardized 422 error response
 * if validation checks fail.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(res, 422, "Validation failed", formattedErrors);
  }

  next();
};
