// server.js
// Minimal TicketBright backend for attendee CSV export

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// -------- Storage layout --------
// ./data/events/<eventId>/attendees.csv
// Header: attendeeId,name,email,ticketType,checkedIn,claimedAt
const DATA_DIR = path.join(__dirname, 'data', 'events');
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

// CSV helpers
const csvEscape = (val) => {
  // Turn anything into a safe string and escape quotes
  const s = (val ?? '').toString().replace(/"/g, '""');

  // Basic CSV injection guard: if the first char is = + - @, prefix with a single quote
  // (Excel/Sheets formula injection mitigation)
  if (/^[=+\-@]/.test(s)) return `"'"${s}"`;
  // Wrap in quotes if it contains a comma, quote, or newline
  if (/[",\n]/.test(s)) return `"${s}"`;
  return s;
};

const writeCsvRow = (arr) => arr.map(csvEscape).join(',') + '\n';
const csvHeader = 'attendeeId,name,email,ticketType,checkedIn,claimedAt\n';

// --- UTIL: path to event CSV
const csvPathForEvent = (eventId) =>
  path.join(DATA_DIR, eventId, 'attendees.csv');

// --- Ensure CSV exists with header
const ensureCsv = (eventId) => {
  const dir = path.dirname(csvPathForEvent(eventId));
  ensureDir(dir);
  const csvPath = csvPathForEvent(eventId);
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, csvHeader, 'utf8');
  }
};

// ------------- Routes -------------

// POST /api/events/:eventId/attendees
// Body: { attendeeId, name, email, ticketType, checkedIn (bool), claimedAt (ISO string) }
app.post('/api/events/:eventId/attendees', (req, res) => {
  try {
    const { eventId } = req.params;
    let {
      attendeeId,
      name,
      email,
      ticketType = 'free',
      checkedIn = false,
      claimedAt = new Date().toISOString(),
    } = req.body || {};

    // Simple validation (adjust as needed)
    if (!eventId || !name || !email) {
      return res.status(400).json({ error: 'eventId, name, and email are required' });
    }
    if (!attendeeId) {
      // Create a simple unique-ish ID if not provided
      attendeeId = 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    }

    ensureCsv(eventId);
    const row = writeCsvRow([
      attendeeId,
      name,
      email,
      ticketType,
      checkedIn ? 'true' : 'false',
      claimedAt
    ]);
    fs.appendFileSync(csvPathForEvent(eventId), row, 'utf8');

    return res.status(201).json({ ok: true, attendeeId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to save attendee' });
  }
});

// GET /api/events/:eventId/attendees.csv
// Sends the CSV as a download
app.get('/api/events/:eventId/attendees.csv', (req, res) => {
  const { eventId } = req.params;
  try {
    ensureCsv(eventId);
    const file = csvPathForEvent(eventId);

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="attendees_${eventId}.csv"`);

    // Stream the file
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.status(500).end('Error reading CSV'));
    stream.pipe(res);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// (Optional) GET /api/events/:eventId/attendees (JSON view for debugging)
app.get('/api/events/:eventId/attendees', (req, res) => {
  const { eventId } = req.params;
  try {
    ensureCsv(eventId);
    const file = csvPathForEvent(eventId);
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    const headers = lines.shift().split(',');
    const json = lines.map(line => {
      // Split respecting quotes – this is a minimal parser good enough for our fields
      // (For more complex CSV, consider a parser like 'csv-parse')
      const cells = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i + 1] === '"' && inQ) { cur += '"'; i++; continue; }
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { cells.push(cur); cur = ''; continue; }
        cur += ch;
      }
      cells.push(cur);
      const obj = {};
      headers.forEach((h, idx) => (obj[h] = cells[idx] ?? ''));
      return obj;
    });
    res.json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to read attendees' });
  }
});

// ----------- Static (optional) -----------
// If you want to serve your existing static frontend from the same server:
// app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));
// ----------- Boot -----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TicketBright CSV service running on http://localhost:${PORT}`));
