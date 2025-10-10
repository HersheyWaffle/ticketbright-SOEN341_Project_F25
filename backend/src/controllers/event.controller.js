import { getAttendeesForEvent } from "../services/event.service.js";
import { generateCSV } from "../utils/csvExporter.js";

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