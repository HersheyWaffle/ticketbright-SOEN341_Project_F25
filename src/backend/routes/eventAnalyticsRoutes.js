import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET /api/events/:eventId/analytics
router.get("/:eventId/analytics", async (req, res) => {
    const { eventId } = req.params;

    try {
        const [event] = await db.query(
            "SELECT id, name, capacity FROM events WHERE id = ?",
            [eventId]
        );

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        const [stats] = await db.query(
            `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN checked_in = 1 THEN 1 ELSE 0 END) AS attended,
         AVG(rating) AS avgRating
       FROM attendees
       WHERE event_id = ?`,
            [eventId]
        );

        const ticketsSold = stats.total || 0;
        const attendances = stats.attended || 0;
        const attendanceRate = ticketsSold
            ? Number(((attendances / ticketsSold) * 100).toFixed(2))
            : 0;
        const remainingCapacity = Math.max(event.capacity - ticketsSold, 0);
        const averageRating = stats.avgRating ? Number(stats.avgRating.toFixed(2)) : 0;

        return res.json({
            eventId,
            ticketsSold,
            attendances,
            attendanceRate,
            averageRating,
            remainingCapacity,
        });
    } catch (err) {
        console.error("[Analytics] Error:", err);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

export default router;