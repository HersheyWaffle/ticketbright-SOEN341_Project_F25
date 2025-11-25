// src/backend/utils/eventValidation.js

function isValidEventPayload(payload) {
  if (!payload || typeof payload !== "object") return false;

  const { title, date } = payload;

  // title is required, must be non-empty string
  if (typeof title !== "string" || title.trim().length === 0) {
    return false;
  }

  // date is required, must be non-empty string
  if (typeof date !== "string" || date.trim().length === 0) {
    return false;
  }

  // super simple rule for now: if both exist, we call it valid
  return true;
}

module.exports = { isValidEventPayload };
