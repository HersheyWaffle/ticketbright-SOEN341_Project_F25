// events.js --> defines routes which are under /api/events
// we'll just start with a ping route to see if wiring works

const express = require('express'); // import express to be able to create a router object
const router = express.Router(); // New router instance

// Database mock 
const events = [];// events will be pushed in this array
let nextId = 1;

/* validate incoming JSON for creating an event
   - returns an object of field errors ({} means valid) */
function validateEvent(body) {
  const errors = {}; // validate input and also return an object of field errors

  // title requirements (string)
  if (!body.title || typeof body.title !== 'string') {
    errors.title = 'required (string)';
  }

  // description requirements (string)
  if (!body.description || typeof body.description !== 'string') {
    errors.description = 'required (string)';
  }

  // location requirements (string)
  if (!body.location || typeof body.location !== 'string') {
    errors.location = 'required (string)';
  }

  // ISO type string to assure right format of date and time
  if (!body.start_at) errors.start_at = 'required (ISO string)';
  if (!body.end_at)   errors.end_at   = 'required (ISO string)';

  // total capacity which needs to be >= 0
  const cap = Number(body.capacity_total);
  if (body.capacity_total == null || Number.isNaN(cap) || cap < 0) {
    errors.capacity_total = 'must be a number >= 0';
  }

  // IF we need to implement the payment method
  /* if (typeof body.is_paid !== 'boolean') {
       errors.is_paid = 'must be boolean (true/false)';
     } */

  // verifying dates if provided
  if (body.start_at && body.end_at) {
    const start = new Date(body.start_at);
    const end   = new Date(body.end_at);

    if (Number.isNaN(start.getTime())) errors.start_at = 'invalid date';
    if (Number.isNaN(end.getTime()))   errors.end_at   = 'invalid date';

    if (!errors.start_at && !errors.end_at && end <= start) {
      errors.end_at = 'must be after start_at';
    }
  }

  return errors;
}

/* Api/events implementation
   --> Reads JSON
   --> Validates fields
   --> Creates an event in MEM
   --> Return 201 for new event and 400 with errors on bad input */
router.post('/', (req, res) => {
  const errors = validateEvent(req.body);

  // validate errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const newEvent = {
    id: nextId++,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category || null,  // depends if needed
    location: req.body.location,
    start_at: req.body.start_at,
    end_at: req.body.end_at,
    capacity_total: Number(req.body.capacity_total),
    /* is_paid: req.body.is_paid, */       // keep commented until team decides
    created_at: new Date().toISOString(),
  };

  events.push(newEvent);                    // to save in the memory list
  return res.status(201).json(newEvent);    // send back the created event
});

// To see what we stored
router.get('/', (req, res) => {
  res.json({ count: events.length, events });
});

// tiny ping route to confirm router wiring
router.get('/_ping', (req, res) => {
  res.json({ ok: true, where: 'events router' });
});

module.exports = router; // exporting router so index.js can mount it at /api/events
