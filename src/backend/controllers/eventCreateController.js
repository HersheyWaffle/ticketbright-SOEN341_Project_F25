
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

    // IMPORTANT: never trust bannerPath coming from client
    delete data.bannerPath;

    // if banner uploaded, move to event folder and save RELATIVE path
    if (req.file) {
      const tmpPath = req.file.path.replace(/\\/g, "/"); // multer temp location
      const destPath = path.join(backendDataDir, req.file.filename);

      // move file into your event folder
      fs.renameSync(tmpPath, destPath);

      // store RELATIVE path in DB (what frontend should use)
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
    const param = req.params.id;

    // Try UUID primary key first, then fallback to eventID slug
    const event = await Event.findOne({
      where: {
        [Op.or]: [
          { id: param },        // UUID
          { eventID: param },
        ],
      },
    });

    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Failed to fetch event:", err);
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

export const getOrganizationsFromEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      attributes: ["organizerName", "organizerUsername", "organizerEmail"],
    });

    const orgMap = new Map();

    for (const e of events) {
      const orgName = e.organizerName || "Unknown Organization";
      const username = e.organizerUsername || null;
      const email = e.organizerEmail || null;

      if (!orgMap.has(orgName)) {
        orgMap.set(orgName, {
          name: orgName,
          organizers: new Map(), // key = email or username
          eventCount: 0,
        });
      }

      const org = orgMap.get(orgName);
      org.eventCount += 1;

      // Use email first as key (more stable), fallback to username
      const key = email || username || Math.random().toString(36);
      if (!org.organizers.has(key)) {
        org.organizers.set(key, { username, email });
      }
    }

    const result = Array.from(orgMap.values()).map(org => ({
      name: org.name,
      eventCount: org.eventCount,
      organizers: Array.from(org.organizers.values()),
      organizerCount: org.organizers.size,
    }));

    res.json(result);
  } catch (err) {
    console.error("Org summary fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch organizations from events" });
  }
};