import express from "express";
import multer from "multer";
import { validateTicket } from "../controllers/ticketValidationController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// POST /api/tickets/validate
router.post('/tickets/validate', upload.single('file'), validateTicket);

export default router;