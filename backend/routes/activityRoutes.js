import express from "express";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getActivities)
  .post(createActivity);

router
  .route("/:id")
  .get(getActivityById)
  .put(updateActivity)
  .delete(deleteActivity);

export default router;
