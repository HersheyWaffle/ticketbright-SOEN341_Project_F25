import { getAttendeesForEvent } from "../services/event.service.js";
import { fetchEventDashboard } from "../services/event.service.js";
import { generateCSV } from "../utils/csvExporter.js";

//TODO clean out redundant csv export code

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