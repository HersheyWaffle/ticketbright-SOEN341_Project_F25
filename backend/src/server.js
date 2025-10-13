// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";
import ticketValidationRoutes from "./routes/ticketValidationRoutes.js";

dotenv.config();

const app = express();
app.use(cors());   
app.use(express.json());

// Routes
app.use("/api/events", eventRoutes);
app.use("/api", ticketValidationRoutes);//Qr code validation 

// Base route
app.get("/", (_req, res) => {
  res.send("Event Management Backend is running!");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
