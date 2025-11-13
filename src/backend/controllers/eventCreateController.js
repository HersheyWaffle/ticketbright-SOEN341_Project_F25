
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import Event from "../models/event.js";

function makeEventID(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_");
}

/**
 * Create new event
 */
export const createEvent = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title) {
      return res.status(400).json({ success: false, error: "Event title is required" });
    }

    // generate sanitized eventID
    const eventID = makeEventID(data.title);
    data.eventID = eventID;

    // check for duplicates
    let existingEvent = await Event.findOne({ where: { eventID } });
    if (existingEvent && existingEvent.status === "published") {
      return res.status(400).json({ success: false, error: "An event with this title already exists" });
    }

    // create data folder
    const backendDataDir = path.join(process.cwd(), "src", "backend", "data", "events", eventID);
    if (!fs.existsSync(backendDataDir)) fs.mkdirSync(backendDataDir, { recursive: true });

    // if banner uploaded, move to event folder
    if (req.file) {
      data.bannerPath = path.posix.join("data", "events", eventID, req.file.filename);
    }

    let savedEvent;
    if (existingEvent) {
      await existingEvent.update(data);
      savedEvent = existingEvent;
    } else {
      savedEvent = await Event.create(data);
    }

    res.status(200).json({ success: true, event: savedEvent });
  } catch (err) {
    console.error("Create event failed:", err);
    res.status(500).json({ success: false, error: "Failed to create event" });
  }
};

/**
 * Get all events (for dashboard)
 */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [["date", "DESC"]],
    });
    res.json(events);
  } catch (err) {
    console.error("Fetch events failed:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/**
 * Get event by ID (for detailed view)
 */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

/**
 * Get analytics summary for all events
 * (for dashboard summary at the top)
 */
export const getEventSummary = async (req, res) => {
  try {
    const events = await Event.findAll();

    const totalTicketsSold = events.reduce(
      (sum, e) => sum + (e.ticketsSold || 0),
      0
    );
    const totalCapacity = events.reduce(
      (sum, e) => sum + (e.capacity || 0),
      0
    );
    const avgRating =
      events.length > 0
        ? (
          events.reduce((sum, e) => sum + (e.rating || 0), 0) /
          events.length
        ).toFixed(1)
        : 0;

    const attendanceRate =
      totalCapacity > 0
        ? Math.round((totalTicketsSold / totalCapacity) * 100)
        : 0;

    res.json({
      ticketsSoldTotal: totalTicketsSold,
      attendanceRateTotal: `${attendanceRate}%`,
      ratingAverage: avgRating,
    });
  } catch (err) {
    console.error("Summary fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

/**
 * Update analytics for an event
 * (used when an attendee buys a ticket or checks in)
 */
export const updateEventStats = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.update(updates);
    res.json({ success: true, event });
  } catch (err) {
    console.error("Update stats failed:", err);
    res.status(500).json({ error: "Failed to update event stats" });
  }
};

export const searchFields = async (req, res) => {
  try {
    const { query = "", category } = req.query;
    const where = {};

    // filter by title, description, tags, organizerName, etc.
    if (query) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { tags: { [Op.like]: `%${query}%` } },
        { organizerName: { [Op.like]: `%${query}%` } },
      ];
    }

    if (category) where.categories = { [Op.like]: `%${category}%` };

    const events = await Event.findAll({
      where,
      order: [["date", "ASC"]],
    });

    res.json(events);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const incrementTicket = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const incrementBy = parseInt(req.body.incrementBy || 1, 10);
    const newCount = (event.ticketsSold || 0) + incrementBy;

    await event.update({ ticketsSold: newCount });

    res.json({ success: true, ticketsSold: newCount });
  } catch (err) {
    console.error("Failed to update tickets:", err);
    res.status(500).json({ error: "Failed to update tickets" });
  }
};