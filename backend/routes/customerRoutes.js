import express from "express";
import {
  getCustomers,
  getCustomerById,
  getCustomerDetails,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createCustomerValidator,
  updateCustomerValidator,
  customerQueryValidator,
} from "../validators/customerValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(customerQueryValidator, validateRequest, getCustomers)
  .post(createCustomerValidator, validateRequest, createCustomer);

router.get("/:id/details", getCustomerDetails);

router
  .route("/:id")
  .get(getCustomerById)
  .put(updateCustomerValidator, validateRequest, updateCustomer)
  .delete(authorizeRoles("Admin", "Manager"), deleteCustomer);

export default router;
