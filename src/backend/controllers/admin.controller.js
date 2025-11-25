import {
  listPendingOrganizersSvc,
  approveOrganizerSvc,
  rejectOrganizerSvc,
  listPendingEventsSvc,
  listOrganizersSvc,
  moderateEventSvc,
  assignRoleSvc,
} from "../services/admin.service.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Event from "../models/event.js";

// GET /api/admin/analytics/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalEvents = await Event.count(); // or add where:{status:"published"} if you want
    const totalTicketsIssued = (await Event.sum("ticketsSold")) || 0;

    res.json({
      totalEvents,
      totalTicketsIssued,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to load admin stats." });
  }
};

// GET /api/admin/analytics/monthly
export const getMonthlyTickets = async (req, res) => {
  try {
    // SQLite month bucket: 'YYYY-MM'
    const rows = await Event.findAll({
      attributes: [
        [sequelize.fn("strftime", "%Y-%m", sequelize.col("date")), "month"],
        [sequelize.fn("sum", sequelize.col("ticketsSold")), "tickets"],
      ],
      where: {
        date: { [Op.not]: null },
      },
      group: ["month"],
      order: [[sequelize.literal("month"), "ASC"]],
      raw: true,
    });

    // rows like: [{ month: '2025-01', tickets: 120 }, ...]
    res.json(rows);
  } catch (err) {
    console.error("Monthly tickets error:", err);
    res.status(500).json({ message: "Failed to load monthly ticket stats." });
  }
};

// GET /api/admin/organizers/pending
export const listPendingOrganizers = async (_req, res) => {
  const list = await listPendingOrganizersSvc();
  return res.status(200).json(list);
};

// POST /api/admin/organizers/:id/approve
export const approveOrganizer = async (req, res) => {
  const { id } = req.params;
  const out = await approveOrganizerSvc(id);
  if (!out) return res.status(404).json({ message: "Organizer not found" });
  return res.status(200).json(out.user);
};

// POST /api/admin/organizers/:id/reject
export const rejectOrganizer = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const out = await rejectOrganizerSvc(id, reason);
  if (!out) return res.status(404).json({ message: "Organizer not found" });
  return res.status(200).json(out.user);
};

// GET /api/admin/events/pending
export const listPendingEvents = async (_req, res) => {
  const list = await listPendingEventsSvc();
  return res.status(200).json(list);
};

// GET /api/admin/organizers?status=pending|approved|rejected|all
export const listOrganizers = async (req, res) => {
  const { status = "pending" } = req.query;
  const list = await listOrganizersSvc(status);
  return res.status(200).json(list);
};

// GET /api/admin/events/published
export const getPublishedEventsForModeration = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: "published" },
      order: [["date", "ASC"]],
    });

    res.json(events);
  } catch (err) {
    console.error("getPublishedEventsForModeration error:", err);
    res.status(500).json({ message: "Failed to load published events." });
  }
};


// POST /api/admin/events/:id/moderate  { action: "approve" | "reject" }
export const moderatePublishedEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    // Only allow moderation of published events
    if (event.status !== "published") {
      return res.status(400).json({
        message: `Only published events can be moderated. Current status: ${event.status}`,
      });
    }

    if (action === "approve") {
      event.status = "approved";
      await event.save();
      return res.json({ message: "Event approved." });
    }

    if (action === "reject") {
      await event.destroy(); // delete on reject
      return res.json({ message: "Event rejected and deleted." });
    }

    return res.status(400).json({ message: "Invalid action." });
  } catch (err) {
    console.error("moderatePublishedEvent error:", err);
    res.status(500).json({ message: "Moderation failed." });
  }
};

// POST /api/admin/roles/assign
export const assignRole = async (req, res) => {
  const { userId, role } = req.body || {};
  if (!userId || !role) return res.status(400).json({ message: "userId and role required" });
  const out = await assignRoleSvc(userId, role);
  if (out?.invalidRole) return res.status(400).json({ message: "Invalid role" });
  if (out?.notFound) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(out.user);
};
