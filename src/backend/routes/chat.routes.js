// src/backend/routes/chat.routes.js
import express from "express";
import {
  listMessages,
  addMessage
} from "../controllers/chat.controller.js";

// If later you want to require login, you can do:
// import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Optionally: router.use(authMiddleware);

// GET /api/chat/:eventId  -> list messages for an event
router.get("/:eventId", listMessages);

// POST /api/chat/:eventId -> add a new message
router.post("/:eventId", addMessage);

export default router;
