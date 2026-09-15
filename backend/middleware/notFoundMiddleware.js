import { errorResponse } from "../utils/apiResponse.js";

/**
 * Not Found (404) Middleware
 * Catches any HTTP requests directed to unhandled routes.
 */
export const notFound = (req, res) => {
  return errorResponse(
    res,
    404,
    `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  );
};
