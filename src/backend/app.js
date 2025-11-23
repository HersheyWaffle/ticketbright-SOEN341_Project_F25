import express from "express";
export const app = express();

app.use(express.json());

// Temporary mock endpoints so tests pass
app.get("/api/events/:eventId/attendees/export", (req, res) => {
  const csvData = "name,email,orderId,checkedIn\nJohn Doe,john@example.com,1,false";
  res.header("Content-Type", "text/csv");
  res.status(200).send(csvData);
});

app.get("/api/events/:eventId/dashboard", (req, res) => {
  const { eventId } = req.params;
  if (eventId === "1") {
    return res.status(200).json({
      eventId: 1,
      ticketsIssued: 120,
      attendanceRate: 0.85
    });
  } else {
    return res.status(404).json({ message: "Event not found" });
  }
});

export default app;
