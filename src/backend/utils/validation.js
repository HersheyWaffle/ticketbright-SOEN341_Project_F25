function isValidUsername(username) {
  return typeof username === "string" && username.trim().length > 0;
}
module.exports = { isValidUsername };
