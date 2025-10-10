import express from "express";
import { exportAttendees, createEvent } from "../controllers/event.controller.js";
import { authenticateOrganizer } from "../middleware/auth.middleware.js";

const router = express.Router();


// GET /api/events/:eventId/attendees/export
router.get("/:eventId/attendees/export", authenticateOrganizer, exportAttendees);

router.post("/", authenticateOrganizer, createEvent);

// TEMP for local test
//router.post("/", createEvent);


export default router;