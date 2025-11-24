// src/backend/utils/password.js

function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  // super simple rule: at least 6 characters
  return password.length >= 6;
}

module.exports = { isStrongPassword };
