import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import eventAnalyticsRoutes from "./routes/eventAnalyticsRoutes.js";
import ticketValidationRoutes from "./routes/ticketValidationRoutes.js";
import attendeeCSVRoutes from "./routes/attendeeCSVRoutes.js";
import eventCreateRoutes from "./routes/eventCreateRoutes.js";
import sequelize from "./config/db.js";
import Event from "./models/Event.js";

dotenv.config()

const app = express();
app.use(cors());   
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", ticketValidationRoutes);
app.use("/api/events", attendeeCSVRoutes);
app.use("/api/events", eventAnalyticsRoutes);
app.use("/api/events", eventCreateRoutes);

// Base route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/main/main.html"));
});

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/analytics/analytics.html"));
});

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/create/event-create.html"));
});

sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));