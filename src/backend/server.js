import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import eventRoutes from "./routes/event.routes.js";
import ticketValidationRoutes from "./routes/ticketValidationRoutes.js";
import attendeeCSVRoutes from "./routes/attendeeCSVRoutes.js";

dotenv.config()

const app = express();
app.use(cors());   
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));

// Routes
//app.use("/api/events", eventRoutes);
app.use("/api", ticketValidationRoutes);//Qr code validation 
app.use("/api/events", attendeeCSVRoutes);//Qr code validation 

// Base route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/main/main.html"));
});

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/analytics/analytics.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));