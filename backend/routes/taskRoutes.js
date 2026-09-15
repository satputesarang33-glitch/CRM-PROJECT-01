import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
  taskQueryValidator,
} from "../validators/taskValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(taskQueryValidator, validateRequest, getTasks)
  .post(createTaskValidator, validateRequest, createTask);

router.patch("/:id/complete", completeTask);

router
  .route("/:id")
  .get(getTaskById)
  .put(updateTaskValidator, validateRequest, updateTask)
  .delete(deleteTask);

export default router;
