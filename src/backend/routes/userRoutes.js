import express from "express";
import { signupUser, loginUser, getUserByUsername } from "../controllers/userController.js";
const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/by-username/:username", getUserByUsername);

export default router;