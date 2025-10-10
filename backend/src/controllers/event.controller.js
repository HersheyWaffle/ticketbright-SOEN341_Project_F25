import { getAttendeesForEvent, createEventService } from "../services/event.service.js";
import { generateCSV } from "../utils/csvExporter.js";

// ------------------------------
// EXPORT ATTENDEES
// ------------------------------
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
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting attendees:", error);
    return res.status(500).json({ message: "Failed to export attendee list." });
  }
};

// ------------------------------
// CREATE EVENT
// ------------------------------
export const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    console.log("createEvent body =>", eventData);

    // Normalize & validate
    let {
      title,
      description,
      event_date,
      event_time,
      location,
      capacity,
      ticket_type,
      price,
      organizer_id,
    } = eventData;

    if (capacity !== undefined && capacity !== null) {
      capacity = Number(capacity);
    }

    if (ticket_type === "free") {
      price = null;
    } else if (ticket_type === "paid") {
      price = Number(price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ message: "For paid events, price must be a positive number." });
      }
    } else {
      return res.status(400).json({ message: "ticket_type must be 'free' or 'paid'." });
    }

    const cleanEvent = {
      title,
      description,
      event_date,
      event_time,
      location,
      capacity,
      ticket_type,
      price,
      organizer_id: organizer_id ?? null,
    };

    // Save to DB
    const newEvent = await createEventService(cleanEvent);
    return res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Error creating event" });
  }
};
