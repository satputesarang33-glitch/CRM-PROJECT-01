import express from "express";
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
} from "../controllers/dealController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createDealValidator,
  updateDealValidator,
  updateDealStageValidator,
  dealQueryValidator,
} from "../validators/dealValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(dealQueryValidator, validateRequest, getDeals)
  .post(createDealValidator, validateRequest, createDeal);

router.patch(
  "/:id/stage",
  updateDealStageValidator,
  validateRequest,
  updateDealStage
);

router
  .route("/:id")
  .get(getDealById)
  .put(updateDealValidator, validateRequest, updateDeal)
  .delete(authorizeRoles("Admin", "Manager"), deleteDeal);

export default router;
