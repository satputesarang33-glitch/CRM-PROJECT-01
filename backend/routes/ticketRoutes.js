import express from "express";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  assignTicket,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  createTicketValidator,
  updateTicketValidator,
  updateTicketStatusValidator,
  assignTicketValidator,
  ticketQueryValidator,
} from "../validators/ticketValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(ticketQueryValidator, validateRequest, getTickets)
  .post(createTicketValidator, validateRequest, createTicket);

router.patch(
  "/:id/status",
  updateTicketStatusValidator,
  validateRequest,
  updateTicketStatus
);

router.patch(
  "/:id/assign",
  assignTicketValidator,
  validateRequest,
  assignTicket
);

router
  .route("/:id")
  .get(getTicketById)
  .put(updateTicketValidator, validateRequest, updateTicket)
  .delete(authorizeRoles("Admin", "Manager"), deleteTicket);

export default router;
