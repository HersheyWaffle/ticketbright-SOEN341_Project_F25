// backend/src/app.js
import express from "express";
import eventRoutes from "./routes/event.routes.js";

const app = express();

// Parse JSON request bodies (REQUIRED for req.body)
app.use(express.json());
// (optional but nice for forms)
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/api/events", eventRoutes);

// health check (optional)
app.get("/health", (req, res) => res.json({ ok: true }));

export default app;
