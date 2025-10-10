import pool from "../config/db.js"; // TODO add PostgreSQL connection pool
//  CREATE EVENT (Service Layer) 
// This service takes validated event data from the controller and inserts
// one row into the `events` table. It returns the inserted row (including
// the generated UUID `id`) so the API can send it back to the client.
export const createEventService = async (eventData) => {
  // Destructure what we expect from the controller / request body.
  // NOTE: If the frontend changes field names, update these.
  const {
    title,
    description,
    event_date,     // string, e.g. "2025-12-05"  (DATE)
    event_time,     // string, e.g. "18:00"       (TIME)
    location,
    capacity,       // integer or null
    ticket_type,    // 'free' | 'paid'
    price,          // number or null (free events store NULL)
    organizer_id,   // may be injected by auth middleware; can be NULL for now
  } = eventData;

  // Use parameterized SQL to avoid SQL injection.
  // RETURNING * gives us the full inserted row (including uuid).
  const insertSql = `
    INSERT INTO events
      (title, description, event_date, event_time, location, capacity, ticket_type, price, organizer_id)
    VALUES
      ($1,    $2,          $3,         $4,        $5,       $6,       $7,          $8,    $9)
    RETURNING *;
  `;

  // Order matters: indices must match the $1..$9 placeholders above.
  const values = [
    title ?? null,
    description ?? null,
    event_date,          // required (DB constraint will reject NULL)
    event_time,          // required
    location,            // required
    capacity ?? null,
    ticket_type,         // required ('free' or 'paid')
    // For free events, store NULL so numeric checks don’t complain.
    ticket_type === "free" ? null : (price ?? null),
    organizer_id ?? null,
  ];

  // Prefer a client when you need transactions; for a single insert,
  // pool.query is fine and returns rows directly.
  const result = await pool.query(insertSql, values);

  // rows[0] is the inserted row (thanks to RETURNING *).
  return result.rows[0];
};

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