import { getAttendeesForEvent } from "../services/event.service.js";
import { fetchEventDashboard } from "../services/event.service.js";
import { generateCSV } from "../utils/csvExporter.js";

//TODO clean out redundant csv export code
// backend/src/controllers/event.controller.js
import { getAttendeesForEvent, createEventService } from "../services/event.service.js";
import { generateCSV } from "../utils/csvExporter.js";

//helper local to this
const toInt = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

const toNumeric = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const toArray = (v) => {
  if (!v) return null;
  if (Array.isArray(v)) return v.length ? v : null;
  const s = String(v).trim();
  if (!s) return null;
  return s.split(",").map(x => x.trim()).filter(Boolean);
};

const computeDurationMinutes = (value, unit) => {
  const v = toInt(value);
  if (!v) return null;
  const u = (unit || "").toLowerCase();
  if (u === "minutes") return v;
  if (u === "hours")   return v * 60;
  if (u === "days")    return v * 60 * 24;
  return v;
};


export const exportAttendees = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const organizerId = req.user.id;

    const attendees = await getAttendeesForEvent(eventId, organizerId);

    if (!attendees || attendees.length === 0) {
      return res.status(404).json({ message: "No attendees found for this event." });
    }

    const csv = generateCSV(attendees);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendees_${eventId}.csv`);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendees_${eventId}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting attendees:", error);
    return res.status(500).json({ message: "Failed to export attendee list." });
  }
};

export const getEventDashboard = async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({ message: "Missing eventId param" });
  }

  try {
    const dashboard = await fetchEventDashboard(eventId);

    if (!dashboard) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(dashboard);
  } catch (err) {
    console.error("getEventDashboard error:", err);
    return res.status(500).json({ message: "Failed to get event dashboard" });
  }
};

  // CREATE EVENT
   //- Accept both old field names and new frontend field names.
   //- Normalize  the DB schema used by the service.

export const createEvent = async (req, res) => {
  try {
    const b = req.body || {};
    console.log("createEvent body =>", b);

    // Map NEW frontend names DB columns (snake_case) your service expects
    
    const title       = b.title ?? null;
    const subtitle    = b.subtitle ?? null;
    const description = b.description ?? null;

    // Dates/times (accept either the old names or the new ones)
    const event_date  = b.event_date ?? b.date ?? null; // 'YYYY-MM-DD'
    const event_time  = b.event_time ?? b.time ?? null; // 'HH:MM'

    // Mode + conditional fields (new)
    const mode        = b.mode ?? null; // 'in-person' | 'online' | 'hybrid'
    const event_link  = (mode === "online" || mode === "hybrid") ? (b.eventLink ?? b.event_link ?? null) : null;
    const location    = (mode === "in-person" || mode === "hybrid")
                          ? (b.location ?? null)
                          : (mode === "online" ? null : (b.location ?? null)); // keep old behavior if mode missing

    // Organizer fields (new)
    const organizer_name  = b.organizerName  ?? b.organizer_name  ?? null;
    const organizer_email = b.organizerEmail ?? b.organizer_email ?? null;
    const organizer_type  = b.organizerType  ?? b.organizer_type  ?? null;

    const accessibility = b.accessibility ?? null;
    const banner_url    = b.banner ?? b.banner_url ?? null;

    // Arrays (accept comma-separated strings too)
    const categories = toArray(b.categories);
    const tags       = toArray(b.tags);

    // Capacity & ticketing
    const capacity    = toInt(b.capacity);
    const ticket_type = b.ticket_type ?? b.ticketType ?? "free";
    let price = null;
    if (ticket_type === "paid") {
      price = toNumeric(b.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ message: "For paid events, price must be a positive number." });
      }
    }

    // Duration (new)
    const duration_minutes = computeDurationMinutes(b.durationValue, b.durationUnit);

    // Registration deadline (new; let DB cast)
    const registration_deadline = b.registrationDeadline ?? null;

    // Organizer id: prefer auth middleware (safer than trusting body)
    const organizer_id = req.user?.id ?? b.organizer_id ?? null;

    // Basic required checks (same spirit as your original)
    if (!title || !description || !event_date || !event_time || !capacity || !ticket_type) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const cleanEvent = {
      // original fields
      title,
      description,
      event_date,
      event_time,
      location,
      capacity,
      ticket_type,
      price,
      organizer_id,

      // new fields
      subtitle,
      speakers: b.speakers ?? null,
      categories,
      tags,
      banner_url,
      organizer_name,
      organizer_email,
      organizer_type,
      mode,
      event_link,
      accessibility,
      duration_minutes,
      registration_deadline,
    };

    const newEvent = await createEventService(cleanEvent);
    return res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Error creating event" });
  }
};
