// src/backend/services/chat.service.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatFilePath = path.join(__dirname, "../data/misc/chat.json");

// Helper: load file
function loadChatFile() {
  const raw = fs.readFileSync(chatFilePath, "utf8");
  return JSON.parse(raw);
}

// Helper: save file
function saveChatFile(data) {
  fs.writeFileSync(chatFilePath, JSON.stringify(data, null, 2));
}

// MAIN EXPORT 1 — list messages for an event
export async function listMessagesSvc(eventId) {
  const chats = loadChatFile();

  if (!chats[eventId]) return [];

  return chats[eventId];
}

// MAIN EXPORT 2 — add a message to an event chat
export async function addMessageSvc(eventId, message) {
  const chats = loadChatFile();

  if (!chats[eventId]) {
    chats[eventId] = [];
  }

  chats[eventId].push({
    username: message.username || "Unknown",
    text: message.text || "",
    timestamp: message.timestamp || new Date().toISOString(),
  });

  saveChatFile(chats);

  return {
    ok: true,
    msg: message,
  };
}
