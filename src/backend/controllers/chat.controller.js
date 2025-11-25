// src/backend/controllers/chat.controller.js
import {
  listMessagesSvc,
  addMessageSvc,
} from "../services/chat.service.js";

// GET /api/chat/:eventId  -> list all messages for an event
export async function listMessages(req, res) {
  const { eventId } = req.params;

  try {
    const messages = await listMessagesSvc(eventId);
    return res.status(200).json(messages);          // [] if none
  } catch (err) {
    console.error("Error listing chat messages:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/chat/:eventId  -> add a new message
export async function addMessage(req, res) {
  const { eventId } = req.params;
  const payload = req.body || {};

  try {
    const out = await addMessageSvc(eventId, payload);

    if (out.bad) {
      return res.status(400).json({ message: out.bad });
    }

    return res.status(201).json(out.msg);          // the message that was saved
  } catch (err) {
    console.error("Error adding chat message:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
