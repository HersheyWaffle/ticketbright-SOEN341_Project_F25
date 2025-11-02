// src/backend/services/admin.service.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data/misc");

const usersPath = path.join(dataDir, "users.json");
const eventsPath = path.join(dataDir, "events.json");

async function readJson(p) {
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw);
}
async function writeJson(p, data) {
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

// ---- Organizers ----
export const listPendingOrganizersSvc = async () => {
  const users = await readJson(usersPath);
  return users.filter((u) => u.status === "pending_organizer");
};

export const approveOrganizerSvc = async (id) => {
  const users = await readJson(usersPath);
  const u = users.find((x) => x.id === Number(id));
  if (!u) return null;
  if (u.status !== "pending_organizer") return { conflict: true };

  u.status = "active";
  u.role = "organizer";
  await writeJson(usersPath, users);
  return { user: u };
};

export const rejectOrganizerSvc = async (id, reason) => {
  const users = await readJson(usersPath);
  const u = users.find((x) => x.id === Number(id));
  if (!u) return null;
  if (u.status !== "pending_organizer") return { conflict: true };

  u.status = "rejected";
  if (reason) u.reject_reason = reason;
  await writeJson(usersPath, users);
  return { user: u };
};

// ---- Events ----
export const listPendingEventsSvc = async () => {
  const events = await readJson(eventsPath);
  return events.filter((e) => e.status === "pending");
};

export const moderateEventSvc = async (eventId, action, reason) => {
  const events = await readJson(eventsPath);
  const idx = events.findIndex((x) => x.id === Number(eventId));
  if (idx === -1) return { notFound: true };

  const e = events[idx];

  switch (action) {
    case "approve": {
      // align wording with FE / counters
      e.status = "approved";
      // clean up any previous reasons
      delete e.reject_reason;
      delete e.unpublish_reason;
      break;
    }

    case "reject": {
      e.status = "rejected";
      if (reason) e.reject_reason = reason;
      // clean up any previous reasons
      delete e.unpublish_reason;
      break;
    }

    // keep these only if you still use them in FE
    case "unpublish": {
      e.status = "unpublished";
      if (reason) e.unpublish_reason = reason;
      delete e.reject_reason;
      break;
    }

    case "delete": {
      events.splice(idx, 1);
      await writeJson(eventsPath, events);
      return { deleted: true };
    }

    default:
      return { badAction: true };
  }

  events[idx] = e;
  await writeJson(eventsPath, events);
  return { event: e };
};

// ---- Roles ----
export const assignRoleSvc = async (userId, role) => {
  const valid = new Set(["admin", "organizer", "student"]);
  if (!valid.has(role)) return { invalidRole: true };

  const users = await readJson(usersPath);
  const u = users.find((x) => x.id === Number(userId));
  if (!u) return { notFound: true };

  u.role = role;
  await writeJson(usersPath, users);
  return { user: u };
};
