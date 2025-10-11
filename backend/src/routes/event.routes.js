import express from "express";
import { exportAttendees, createEvent } from "../controllers/event.controller.js";
import { authenticateOrganizer } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/events/:eventId/attendees/export
router.get("/:eventId/attendees/export", authenticateOrganizer, exportAttendees);

// CREATE (auth ON for real usage)
router.post("/", authenticateOrganizer, createEvent);

// For local ad-hoc testing without a token, you can momentarily disable auth:
//router.post("/", createEvent);

export default router;
