// src/backend/routes/admin.routes.js
import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  listPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
  listPendingEvents,
  moderateEvent,
  assignRole,
} from "../controllers/admin.controller.js";

const router = express.Router();

// If you have auth that sets req.user, place it before requireAdmin.
// router.use(authenticateUser);
router.use(requireAdmin);

// ---- Organizers ----
router.get ("/organizers/pending", listPendingOrganizers);
router.post("/organizers/:id/approve", approveOrganizer);
router.post("/organizers/:id/reject",   rejectOrganizer);

// ---- Events ----
router.get ("/events/pending", listPendingEvents);
router.post("/events/:id/moderate", moderateEvent);

// ---- Roles ----
router.post("/roles/assign", assignRole);

export default router;
