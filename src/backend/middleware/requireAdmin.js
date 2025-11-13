// Guard: only allow users with role === 'admin'
export default function requireAdmin(req, res, next) {
  try {
    const role = req?.user?.role;   // set by your auth (or by the temp mock in server.js)
    if (role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
