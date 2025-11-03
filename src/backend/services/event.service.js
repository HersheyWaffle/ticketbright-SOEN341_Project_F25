// backend/src/services/event.service.js
import pool from "../config/db.js";

/**
 * CREATE EVENT (Service Layer)
 * - Accepts a normalized event object (controller ensures shape).
 * - Inserts one row into `events` and returns the inserted row.
 *
 * NOTE:
 *   We keep your function name to avoid touching the rest of the app.
 *   Any missing optional field is saved as NULL.
 */
export const createEventService = async (eventData) => {
  // Existing fields (your original ones) + newly supported optional fields.
  const {
    // required/core
    title,
    description,
    event_date,   // 'YYYY-MM-DD'
    event_time,   // 'HH:MM'
    location,
    capacity,     // integer or null
    ticket_type,  // 'free' | 'paid'
    price,        // numeric or null (free => null)
    organizer_id, // set by auth middleware, can be null in local tests

    // NEW optional fields from the updated frontend
    subtitle,
    speakers,
    categories,         // array of text or null
    tags,               // array of text or null
    banner_url,
    organizer_name,
    organizer_email,
    organizer_type,
    mode,               // 'in-person' | 'online' | 'hybrid'
    event_link,         // only for online/hybrid
    accessibility,
    duration_minutes,   // computed from durationValue + durationUnit
    registration_deadline, // timestamp
  } = eventData;

  // Explicit column list keeps INSERT robust if the table changes later.
  const insertSql = `
    INSERT INTO events (
      title,
      subtitle,
      description,
      speakers,
      categories,
      tags,
      banner_url,
      organizer_name,
      organizer_email,
      organizer_type,
      event_date,
      event_time,
      mode,
      event_link,
      location,
      accessibility,
      capacity,
      ticket_type,
      price,
      duration_minutes,
      registration_deadline,
      organizer_id
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
    )
    RETURNING *;
  `;

  // Order must match the placeholders above.
  const values = [
    title ?? null,
    subtitle ?? null,
    description ?? null,
    speakers ?? null,
    categories ?? null,          // array or null
    tags ?? null,                // array or null
    banner_url ?? null,
    organizer_name ?? null,
    organizer_email ?? null,
    organizer_type ?? null,
    event_date ?? null,
    event_time ?? null,
    mode ?? null,
    event_link ?? null,
    location ?? null,
    accessibility ?? null,
    capacity ?? null,
    ticket_type ?? null,
    // Ensure free => NULL in DB
    ticket_type === "free" ? null : (price ?? null),
    duration_minutes ?? null,
    registration_deadline ?? null,
    organizer_id ?? null,
  ];

  const result = await pool.query(insertSql, values);
  return result.rows[0];
};

/**
 * Unchanged: export attendees (left as-is)
 */
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