import express from "express";
import { exportAttendees } from "../controllers/event.controller.js";
import { authenticateOrganizer } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/events/:eventId/attendees/export
router.get("/:eventId/attendees/export", authenticateOrganizer, exportAttendees);

// GET /api/events/:eventId/dashboard
router.get("/:eventId/dashboard", getEventDashboard);

export default router;