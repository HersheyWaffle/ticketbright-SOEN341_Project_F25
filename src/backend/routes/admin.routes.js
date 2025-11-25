// src/backend/routes/admin.routes.js
import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  listPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
  listOrganizers,
  listPendingEvents,
  assignRole,
  getAdminStats,
  getMonthlyTickets,
  getPublishedEventsForModeration,
  moderatePublishedEvent,
} from "../controllers/admin.controller.js";

const router = express.Router();

// If you have auth that sets req.user, place it before requireAdmin.
// router.use(authenticateUser);
router.use(requireAdmin);

// ---- Analytics ----
router.get("/analytics/stats", getAdminStats);
router.get("/analytics/monthly", getMonthlyTickets);

// ---- Organizers ----
router.get ("/organizers/pending", listPendingOrganizers);
router.post("/organizers/:id/approve", approveOrganizer);
router.post("/organizers/:id/reject",   rejectOrganizer);
router.get ("/organizers", listOrganizers);

// ---- Events ----
router.get ("/events/pending", listPendingEvents);
router.get("/events/published", getPublishedEventsForModeration);
router.post("/events/:id/moderate", moderatePublishedEvent);

// ---- Roles ----
router.post("/roles/assign", assignRole);

export default router;
