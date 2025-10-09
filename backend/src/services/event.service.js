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