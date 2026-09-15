import express from "express";
import {
  getStats,
  getPipeline,
  getRevenue,
  getLeadsSummary,
  getCustomersSummary,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/pipeline", getPipeline);
router.get("/revenue", getRevenue);
router.get("/leads", getLeadsSummary);
router.get("/customers", getCustomersSummary);

export default router;
