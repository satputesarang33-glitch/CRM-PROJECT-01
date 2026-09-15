import { errorResponse } from "../utils/apiResponse.js";

/**
 * Role-Based Access Control Middleware
 *
 * Restricts route access to specified CRM roles.
 * Supported roles:
 * - Admin
 * - Manager
 * - Sales Agent
 * - Support Agent
 *
 * @param  {...string} allowedRoles - List of authorized roles (e.g. 'Admin', 'Manager')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Authentication required. User not authenticated."
      );
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${userRole}' is not authorized to access this resource.`
      );
    }

    next();
  };
};
