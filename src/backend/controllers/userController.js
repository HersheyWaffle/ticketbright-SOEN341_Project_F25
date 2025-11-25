import bcrypt from "bcrypt";
import User from "../models/user.js";

export const signupUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      organizationName,
      organizationType
    } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      if (existing.approved === -1) {
        return res.status(403).json({ error: "This email has been rejected." });
      }
      return res.status(400).json({ error: "User already exists" });
    }

    // basic organizer validation
    if (role === "organizer") {
      if (!organizationName || !organizationName.trim()) {
        return res.status(400).json({ error: "Organization name is required for organizers." });
      }
      if (!organizationType || !organizationType.trim()) {
        return res.status(400).json({ error: "Organization type is required for organizers." });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    // students auto-approved = 1, organizers pending = 0
    const approved = role === "student" ? 1 : 0;

    const newUser = await User.create({
      username,
      email,
      password: hashed,
      role,
      approved,
      organizationName: role === "organizer" ? organizationName.trim() : null,
      organizationType: role === "organizer" ? organizationType.trim() : null,
    });

    res.status(201).json({
      success: true,
      message: approved === 1
        ? "Account created successfully!"
        : "Organizer signup pending admin approval.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        approved: newUser.approved,
        organizationName: newUser.organizationName,
        organizationType: newUser.organizationType
      }
    });
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).json({ error: "Failed to sign up" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid password" });

    if (user.approved === 0)
      return res.status(403).json({ error: "Account pending admin approval" });

    if (user.approved === -1)
      return res.status(403).json({ error: "This account has been rejected." });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: [
        "id",
        "username",
        "email",
        "role",
        "organizationName",
        "organizationType",
        "approved"
      ]
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("getUserByUsername failed:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};