import express from "express";
import { registerUser } from "../controllers/userController.js";

const router = express.Router();

// POST /api/register → for user registration
router.post("/register", registerUser);

// POST /api/login → for user login
// router.post("/login", loginUser);

export default router;
