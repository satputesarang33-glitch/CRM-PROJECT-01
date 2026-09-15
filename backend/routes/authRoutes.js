import express from "express";
import {
  login,
  register,
  getMe,
  syncUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { syncUserValidator } from "../validators/authValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Public authentication routes
router.post("/login", login);
router.post("/register", register);

// Protected authentication routes
router.get("/me", protect, getMe);
router.post("/sync-user", protect, syncUserValidator, validateRequest, syncUser);

export default router;
