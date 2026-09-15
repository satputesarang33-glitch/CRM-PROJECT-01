/**
 * Standard API Response Utilities
 * Provides consistent response formats across all CRM endpoints.
 */

/**
 * Send a standardized success response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {any} [data=null] - Payload data
 * @param {object} [pagination=null] - Optional pagination metadata
 */
export const successResponse = (
  res,
  statusCode = 200,
  message = "Operation successful",
  data = null,
  pagination = null
) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 422, 500)
 * @param {string} message - Error description
 * @param {Array|object} [errors=null] - Detailed error list or validation errors
 */
export const errorResponse = (
  res,
  statusCode = 500,
  message = "An unexpected error occurred",
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
