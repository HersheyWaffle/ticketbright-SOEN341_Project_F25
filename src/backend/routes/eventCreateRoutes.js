import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
    createEvent,
    getAllEvents,
    getEventById,
    getEventSummary,
    updateEventStats,
} from "../controllers/eventCreateController.js";

const router = express.Router();

function makeEventID(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s_-]/g, "")
        .replace(/\s+/g, "_");
}

// image storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const eventTitle = req.body.title || "untitled";
        const eventID = makeEventID(eventTitle);
        const dir = path.join("src", "backend", "data", "events", eventID);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
    }
});

const upload = multer({ storage });

router.post("/", upload.single("banner"), createEvent);              // POST /api/events
router.get("/", getAllEvents);              // GET /api/events
router.get("/summary", getEventSummary);    // GET /api/events/summary
router.get("/:id", getEventById);           // GET /api/events/:id
router.patch("/:id", updateEventStats);     // PATCH /api/events/:id

export default router;