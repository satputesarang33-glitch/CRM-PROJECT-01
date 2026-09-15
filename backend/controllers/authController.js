import { db, auth, FieldValue } from "../config/firebase.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY || "AIzaSyCNxbUMi-EPM9gLunSdO5e1a-umRXUyfmM";

/**
 * Authentication Controller
 * Handles login, registration, user profile retrieval, and client sync with Firestore.
 */

/**
 * @desc   Authenticate user with Firebase Authentication and return ID token
 * @route  POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Please provide email and password.");
    }

    // Verify credentials via Firebase Authentication
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      const msg =
        data.error?.message === "EMAIL_NOT_FOUND" ||
        data.error?.message === "INVALID_PASSWORD" ||
        data.error?.message === "INVALID_LOGIN_CREDENTIALS"
          ? "Invalid email or password."
          : data.error?.message || "Authentication failed.";
      return errorResponse(res, 401, msg);
    }

    const uid = data.localId;
    const userDoc = await db.collection("users").doc(uid).get();

    let userProfile = {};
    if (userDoc.exists) {
      userProfile = userDoc.data();
      if (userProfile.isActive === false) {
        return errorResponse(
          res,
          403,
          "Account is deactivated. Please contact an administrator."
        );
      }
    }

    const userPayload = {
      id: uid,
      uid,
      email: data.email,
      firstName: userProfile.firstName || "",
      lastName: userProfile.lastName || "",
      name: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || data.email,
      role: userProfile.role || "Sales Agent",
      phone: userProfile.phone || "",
      profileImage: userProfile.profileImage || "",
      ...userProfile,
    };

    return successResponse(res, 200, "Logged in successfully", {
      token: data.idToken,
      refreshToken: data.refreshToken,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Register a new user in Firebase Auth and Firestore
 * @route  POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName = "",
      lastName = "",
      phone = "",
      role = "Sales Agent",
    } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }

    // Register via Firebase Authentication
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      const msg =
        data.error?.message === "EMAIL_EXISTS"
          ? "An account with this email address already exists."
          : data.error?.message || "Registration failed.";
      return errorResponse(res, 400, msg);
    }

    const uid = data.localId;
    const timestamp = FieldValue.serverTimestamp();

    const newUserData = {
      uid,
      email,
      firstName,
      lastName,
      phone,
      role,
      profileImage: "",
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.collection("users").doc(uid).set(newUserData);

    // Send welcome email asynchronously
    sendWelcomeEmail(email, firstName);

    const userPayload = {
      id: uid,
      name: `${firstName} ${lastName}`.trim() || email,
      ...newUserData,
    };

    return successResponse(res, 201, "Account created successfully", {
      token: data.idToken,
      refreshToken: data.refreshToken,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get currently logged-in user profile
 * @route  GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, "User profile retrieved successfully", req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Sync user profile to Firestore after Firebase Authentication signup
 * @route  POST /api/auth/sync-user
 * @access Private
 */
export const syncUser = async (req, res, next) => {
  try {
    const { uid, email } = req.user;
    const {
      firstName = "",
      lastName = "",
      phone = "",
      role = "Sales Agent",
      profileImage = "",
    } = req.body;

    const userRef = db.collection("users").doc(uid);
    const existingDoc = await userRef.get();

    const timestamp = FieldValue.serverTimestamp();

    if (existingDoc.exists) {
      const updateData = {
        updatedAt: timestamp,
      };

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;
      if (profileImage) updateData.profileImage = profileImage;

      await userRef.update(updateData);
      const updatedSnapshot = await userRef.get();

      return successResponse(
        res,
        200,
        "User profile updated successfully",
        { id: uid, ...updatedSnapshot.data() }
      );
    } else {
      const newUserData = {
        uid,
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

      await userRef.set(newUserData);
      sendWelcomeEmail(email, firstName);

      return successResponse(
        res,
        201,
        "User profile synchronized and created successfully",
        newUserData
      );
    }
  } catch (error) {
    next(error);
  }
};
