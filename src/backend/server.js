import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import eventAnalyticsRoutes from "./routes/eventAnalyticsRoutes.js";
import ticketValidationRoutes from "./routes/ticketValidationRoutes.js";
import attendeeCSVRoutes from "./routes/attendeeCSVRoutes.js";

import adminRouter from "./routes/admin.routes.js";
import orgRouter from "./routes/organizations.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// TEMP mock admin (keep above routes for now)
app.use((req, _res, next) => {
  req.user = { id: 1, role: "admin" };
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));

// ---- ROUTES (now that app exists) ----
app.use("/api", ticketValidationRoutes);
app.use("/api/events", attendeeCSVRoutes);
app.use("/api/events", eventAnalyticsRoutes);
app.use("/api/admin/organizations", orgRouter);  // <-- mount here
app.use("/api/admin", adminRouter);
// --------------------------------------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/main/main.html"));
});
app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/analytics/analytics.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
