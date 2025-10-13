import jwt from "jsonwebtoken";

// NOTE: Bearer auth may be overkill but this is just standard boilerplate stuff anyways
// TODO just a basic skeleton for now, needs proper gen

export const authenticateOrganizer = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "organizer") {
      return res.status(403).json({ message: "Access restricted to organizers only." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};