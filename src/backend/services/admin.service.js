// src/backend/services/admin.service.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data/misc");

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
  const rows = await User.findAll({
    where: { role: "organizer", approved: 0 },
    order: [["createdAt", "DESC"]],
    attributes: ["id", "username", "email", "approved", "createdAt"],
  });

  // Return shape your FE expects
  return rows.map(u => ({
    id: u.id,
    name: u.username,
    email: u.email,
    org: "—", // fill later if you add org on User
    status: "pending",
    date: u.createdAt.toISOString().slice(0, 10),
  }));
};

export const approveOrganizerSvc = async (id) => {
  const u = await User.findOne({
    where: { id, role: "organizer" },
  });

  if (!u) return null;

  u.approved = 1;
  await u.save();

  return { user: u };
};

export const rejectOrganizerSvc = async (id, reason) => {
  const u = await User.findOne({
    where: { id, role: "organizer" },
  });

  if (!u) return null;

  u.approved = -1;
  await u.save();
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

// GET organizers by status
// status: "pending" | "approved" | "rejected" | "all"
export const listOrganizersSvc = async (status = "pending") => {
  const where = { role: "organizer" };

  if (status === "pending") where.approved = 0;
  else if (status === "approved") where.approved = 1;
  else if (status === "rejected") where.approved = -1;
  // "all" => no approved filter

  const rows = await User.findAll({
    where,
    order: [["createdAt", "DESC"]],
    attributes: [
      "id",
      "username",
      "email",
      "approved",
      "createdAt",
      "organizationName",
      "organizationType",
    ],
  });

  return rows.map(u => ({
    id: u.id,
    name: u.username,
    email: u.email,

    // what your table should show
    org: u.organizationName || "—",
    organizationName: u.organizationName,
    organizationType: u.organizationType,

    status:
      u.approved === 1 ? "approved" :
      u.approved === -1 ? "rejected" :
      "pending",

    date: u.createdAt ? u.createdAt.toISOString().slice(0, 10) : "",
  }));
};

// ---- Roles ----
export const assignRoleSvc = async (userId, role) => {
  const valid = new Set(["admin", "organizer", "student"]);
  if (!valid.has(role)) return { invalidRole: true };

  const u = await User.findOne({ where: { id: userId } });
  if (!u) return { notFound: true };

  u.role = role;
  await u.save();

  return { user: u };
};