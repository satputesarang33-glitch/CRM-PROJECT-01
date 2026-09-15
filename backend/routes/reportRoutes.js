import express from "express";
import {
  getSales,
  getRevenue,
  getCustomers,
  getLeads,
  getEmployees,
  getConversion,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Reports typically accessible by Admin and Manager roles
router.get("/sales", authorizeRoles("Admin", "Manager"), getSales);
router.get("/revenue", authorizeRoles("Admin", "Manager"), getRevenue);
router.get("/customers", authorizeRoles("Admin", "Manager"), getCustomers);
router.get("/leads", authorizeRoles("Admin", "Manager"), getLeads);
router.get("/employees", authorizeRoles("Admin", "Manager"), getEmployees);
router.get("/conversion", authorizeRoles("Admin", "Manager"), getConversion);

export default router;
