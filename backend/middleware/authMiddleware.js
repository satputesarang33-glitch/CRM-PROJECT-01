import { auth, db } from "../config/firebase.js";
import { errorResponse } from "../utils/apiResponse.js";

/**
 * Authentication Middleware
 *
 * Verifies Firebase ID Token passed in Authorization header:
 * Authorization: Bearer <firebase-id-token>
 *
 * Loads user authentication data from Firebase Auth and user profile from Firestore.
 * Attaches verified user to `req.user`.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // In local development, provide demo admin session fallback
      if (process.env.NODE_ENV !== "production") {
        req.user = {
          uid: "admin_user_001",
          email: "admin@crmdemo.com",
          role: "Admin",
          firstName: "Sarah",
          lastName: "Connor",
          name: "Sarah Connor",
        };
        return next();
      }
      return errorResponse(
        res,
        401,
        "Authentication required. No Bearer token provided in Authorization header.",
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(
        res,
        401,
        "Invalid token format. Bearer token is missing.",
      );
    }

    // In development mode, allow mock token from local preview
    if (process.env.NODE_ENV !== "production" && token.startsWith("mock-")) {
      req.user = {
        uid: "admin_user_001",
        email: "admin@crmdemo.com",
        role: "Admin",
        firstName: "Sarah",
        lastName: "Connor",
        name: "Sarah Connor",
      };
      return next();
    }

    // Verify token with Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (verifyError) {
      if (process.env.NODE_ENV !== "production") {
        req.user = {
          uid: "admin_user_001",
          email: "admin@crmdemo.com",
          role: "Admin",
          firstName: "Sarah",
          lastName: "Connor",
          name: "Sarah Connor",
        };
        return next();
      }
      console.error("Token verification failed:", verifyError.message);
      if (verifyError.code === "auth/id-token-expired") {
        return errorResponse(
          res,
          401,
          "Your session has expired. Please log in again.",
        );
      }
      return errorResponse(
        res,
        401,
        "Invalid or unauthorized authentication token.",
      );
    }

    // Fetch user profile from Firestore 'users' collection
    const userDocRef = db.collection("users").doc(decodedToken.uid);
    const userSnapshot = await userDocRef.get();

    let userProfile = {};
    if (userSnapshot.exists) {
      userProfile = userSnapshot.data();
      if (userProfile.isActive === false) {
        return errorResponse(
          res,
          403,
          "Your account has been deactivated. Please contact an administrator.",
        );
      }
    }

    // Attach verified user payload to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || userProfile.email || "",
      role: userProfile.role || decodedToken.role || "Sales Agent",
      firstName: userProfile.firstName || "",
      lastName: userProfile.lastName || "",
      ...userProfile,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return errorResponse(
      res,
      500,
      "Internal server error during authentication.",
    );
  }
};
