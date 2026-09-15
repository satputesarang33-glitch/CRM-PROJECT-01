import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(protect);

router
  .route("/")
  .get(authorizeRoles("Admin", "Manager"), getAllUsers)
  .post(authorizeRoles("Admin"), createUser);

router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(authorizeRoles("Admin"), deleteUser);

router.patch("/:id/role", authorizeRoles("Admin"), updateUserRole);
router.patch("/:id/status", authorizeRoles("Admin"), updateUserStatus);

export default router;
