import { errorResponse } from "../utils/apiResponse.js";

/**
 * Centralized Error Handling Middleware
 * Converts uncaught errors and Firebase errors into clean, standardized API responses.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  // Multer file upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(
        res,
        400,
        "File upload failed: File size exceeds the maximum 10MB limit."
      );
    }
    return errorResponse(res, 400, `File upload error: ${err.message}`);
  }

  // Firebase Admin Auth errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("auth/")) {
    switch (err.code) {
      case "auth/id-token-expired":
        return errorResponse(res, 401, "Authentication token has expired.");
      case "auth/user-not-found":
        return errorResponse(res, 404, "User account not found.");
      case "auth/email-already-exists":
        return errorResponse(
          res,
          409,
          "A user account with this email address already exists."
        );
      case "auth/invalid-email":
        return errorResponse(res, 400, "The provided email address is invalid.");
      case "auth/weak-password":
        return errorResponse(
          res,
          400,
          "The password is too weak. Must be at least 6 characters."
        );
      default:
        return errorResponse(res, 400, err.message || "Authentication error.");
    }
  }

  // Firestore standard errors
  if (err.code === 5 || err.message?.includes("NOT_FOUND")) {
    return errorResponse(res, 404, "Requested resource not found.");
  }

  if (err.code === 6 || err.message?.includes("ALREADY_EXISTS")) {
    return errorResponse(res, 409, "Resource already exists.");
  }

  if (err.code === 7 || err.message?.includes("PERMISSION_DENIED")) {
    return errorResponse(res, 403, "Permission denied for this operation.");
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "An unexpected error occurred.";

  return errorResponse(res, statusCode, message);
};
