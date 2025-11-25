function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return email.includes("@") && email.includes(".");
}

module.exports = { isValidEmail };
