const express = require('express');
const multer = require('multer');
const { validateTicket } = require('../controllers/ticketValidationController');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post('/tickets/validate', upload.single('file'), validateTicket);

module.exports = router;
