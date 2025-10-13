import express from "express";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/events", eventRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Event Management Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
