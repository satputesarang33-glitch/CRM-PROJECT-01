import { db, auth, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { paginateQuery } from "../utils/pagination.js";

/**
 * User Management Controller
 * Provides CRUD and role/status assignment operations using Firebase Admin and Firestore.
 */

/**
 * @desc   Get all users with filtering and pagination
 * @route  GET /api/users
 * @access Private (Admin, Manager)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, limit = 20, cursor } = req.query;

    let query = db.collection("users").orderBy("createdAt", "desc");

    if (role) {
      query = query.where("role", "==", role);
    }

    if (status !== undefined) {
      const isActive = status === "true" || status === true;
      query = query.where("isActive", "==", isActive);
    }

    const result = await paginateQuery(query, db.collection("users"), {
      limit,
      cursor,
    });

    return successResponse(
      res,
      200,
      "Users fetched successfully",
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get user profile by ID
 * @route  GET /api/users/:id
 * @access Private (Admin, Manager, or Self)
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization: Admin, Manager, or user accessing their own profile
    if (
      req.user.role !== "Admin" &&
      req.user.role !== "Manager" &&
      req.user.uid !== id
    ) {
      return errorResponse(res, 403, "Not authorized to access this user profile.");
    }

    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, "User profile retrieved successfully", {
      id: userDoc.id,
      ...userDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new user (Firebase Auth + Firestore document)
 * @route  POST /api/users
 * @access Private (Admin)
 */
export const createUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName = "",
      phone = "",
      role = "Sales Agent",
      profileImage = "",
    } = req.body;

    if (!email || !password || !firstName) {
      return errorResponse(
        res,
        400,
        "Email, temporary password, and first name are required."
      );
    }

    // 1. Create account in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`.trim(),
    });

    const timestamp = FieldValue.serverTimestamp();

    // 2. Create profile document in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      phone,
      role,
      profileImage,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.collection("users").doc(userRecord.uid).set(userProfile);

    return successResponse(
      res,
      201,
      "User created successfully in Authentication and Firestore",
      { id: userRecord.uid, ...userProfile }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update user profile
 * @route  PUT /api/users/:id
 * @access Private (Admin or Self)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "Admin" && req.user.uid !== id) {
      return errorResponse(res, 403, "Not authorized to modify this user profile.");
    }

    const { firstName, lastName, phone, profileImage } = req.body;

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, "User not found.");
    }

    const updateData = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    await userRef.update(updateData);
    const updatedSnap = await userRef.get();

    return successResponse(res, 200, "User profile updated successfully", {
      id: updatedSnap.id,
      ...updatedSnap.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete/Disable user
 * @route  DELETE /api/users/:id
 * @access Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.uid === id) {
      return errorResponse(res, 400, "Admins cannot delete their own account.");
    }

    // Disable in Firebase Auth
    try {
      await auth.updateUser(id, { disabled: true });
    } catch (authErr) {
      console.warn("Could not disable user in Firebase Auth:", authErr.message);
    }

    // Mark as inactive in Firestore
    await db.collection("users").doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return successResponse(res, 200, "User successfully deactivated.");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Change user role
 * @route  PATCH /api/users/:id/role
 * @access Private (Admin)
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["Admin", "Manager", "Sales Agent", "Support Agent"];
    if (!validRoles.includes(role)) {
      return errorResponse(
        res,
        400,
        `Invalid role. Must be one of: ${validRoles.join(", ")}`
      );
    }

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, "User not found.");
    }

    await userRef.update({
      role,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return successResponse(res, 200, `User role successfully updated to ${role}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update user active status
 * @route  PATCH /api/users/:id/status
 * @access Private (Admin)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return errorResponse(res, 400, "Field 'isActive' must be a boolean (true/false).");
    }

    if (req.user.uid === id && !isActive) {
      return errorResponse(res, 400, "Admins cannot deactivate themselves.");
    }

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, "User not found.");
    }

    // Sync status with Firebase Auth
    try {
      await auth.updateUser(id, { disabled: !isActive });
    } catch (authErr) {
      console.warn("Auth status update error:", authErr.message);
    }

    await userRef.update({
      isActive,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return successResponse(
      res,
      200,
      `User account ${isActive ? "activated" : "deactivated"} successfully`
    );
  } catch (error) {
    next(error);
  }
};
