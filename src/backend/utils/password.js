function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  return password.length >= 6; // simple rule for learning
}

module.exports = { isStrongPassword };
