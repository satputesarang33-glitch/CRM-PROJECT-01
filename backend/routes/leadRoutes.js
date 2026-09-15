import express from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
} from "../controllers/leadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createLeadValidator,
  updateLeadValidator,
  leadQueryValidator,
} from "../validators/leadValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(leadQueryValidator, validateRequest, getLeads)
  .post(createLeadValidator, validateRequest, createLead);

router.post("/:id/convert", convertLead);

router
  .route("/:id")
  .get(getLeadById)
  .put(updateLeadValidator, validateRequest, updateLead)
  .delete(authorizeRoles("Admin", "Manager"), deleteLead);

export default router;
