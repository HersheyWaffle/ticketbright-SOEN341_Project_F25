import pool from "../config/db.js"; // TODO add PostgreSQL connection pool

export const getAttendeesForEvent = async (eventId, organizerId) => {
  const client = await pool.connect();

  try {
    const eventCheck = await client.query(
      `SELECT id, organizer_id FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      throw new Error("Event not found");
    }

    if (eventCheck.rows[0].organizer_id !== organizerId) {
      throw new Error("Unauthorized");
    }

    const result = await client.query(
      `SELECT 
          users.full_name AS "Full Name",
          users.email AS "Email",
          tickets.type AS "Ticket Type",
          tickets.checked_in AS "Checked In"
        FROM attendees
        JOIN users ON attendees.user_id = users.id
        JOIN tickets ON attendees.ticket_id = tickets.id
        WHERE attendees.event_id = $1`,
      [eventId]
    );

    return result.rows;
  } finally {
    client.release();
  }
};

// TODO right now only sends the data at the endpoint on request, should be displayed in charts

/**
 * Returns an object:
 * {
 *   eventId,
 *   title,
 *   capacity,
 *   ticketsIssued,
 *   attendanceCount,
 *   attendanceRate,    // 0..100 (number), null if ticketsIssued == 0
 *   remainingCapacity,
 *   ticketsByType: [{ type, count }]
 * }
 * Note: It assumes a tickets table with columns: id, event_id, user_id?, type, issued_at, checked_in (boolean).
 * It assumes events table contains id, title, capacity.
 * Queries are parameterized to avoid SQL injection.
 * Attendance rate is expressed as a percentage (0–100) with two decimals. If no tickets issued, attendanceRate is null.
 */
export const fetchEventDashboard = async (eventId) => {
  const client = await pool.connect();

  try {
    // 1) Basic event info (capacity, title etc.)
    const eventRes = await client.query(
      `SELECT id, title, capacity, organizer_id
       FROM events
       WHERE id = $1`,
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      return null; // caller handles 404
    }

    const event = eventRes.rows[0];

    // 2) Aggregates: total tickets issued and checked-in count
    // Assume tickets table has: id, event_id, type, issued_at, checked_in boolean
    const aggRes = await client.query(
      `SELECT
         COUNT(*) FILTER (WHERE event_id = $1) AS tickets_issued,
         COUNT(*) FILTER (WHERE event_id = $1 AND checked_in = TRUE) AS attendance_count
       FROM tickets
       WHERE event_id = $1`,
      [eventId]
    );

    const { tickets_issued: ticketsIssuedRaw, attendance_count: attendanceCountRaw } =
      aggRes.rows[0] || { tickets_issued: 0, attendance_count: 0 };

    const ticketsIssued = parseInt(ticketsIssuedRaw, 10) || 0;
    const attendanceCount = parseInt(attendanceCountRaw, 10) || 0;

    const attendanceRate =
      ticketsIssued === 0 ? null : Number(((attendanceCount / ticketsIssued) * 100).toFixed(2));

    // 3) Remaining capacity
    // If event.capacity is null -> treat as unlimited (null)
    let remainingCapacity = null;
    if (event.capacity !== null && event.capacity !== undefined) {
      remainingCapacity = event.capacity - ticketsIssued;
      if (remainingCapacity < 0) remainingCapacity = 0;
    }

    // 4) Tickets by type
    const byTypeRes = await client.query(
      `SELECT type, COUNT(*) AS count
       FROM tickets
       WHERE event_id = $1
       GROUP BY type
       ORDER BY count DESC`,
      [eventId]
    );

    const ticketsByType = byTypeRes.rows.map((r) => ({
      type: r.type,
      count: parseInt(r.count, 10),
    }));

    return {
      eventId: event.id,
      title: event.title,
      capacity: event.capacity,
      ticketsIssued,
      attendanceCount,
      attendanceRate, // null if no tickets issued
      remainingCapacity,
      ticketsByType,
    };
  } finally {
    client.release();
  }
};