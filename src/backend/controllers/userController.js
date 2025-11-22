import bcrypt from "bcrypt";
import User from "../models/user.js";

export const signupUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // ✅ hash password before saving
    const hashed = await bcrypt.hash(password, 10);

    const approved = role === "student"; // only students auto-approved

    const newUser = await User.create({
      username,
      email,
      password: hashed,
      role,
      approved
    });

    res.status(201).json({
      success: true,
      message: approved
        ? "Account created successfully!"
        : "Organizer signup pending admin approval.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        approved: newUser.approved
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

    if (!user.approved)
      return res.status(403).json({ error: "Account pending admin approval" });

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