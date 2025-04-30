import express from "express";

import { registerUser, loginUser, getProfile, logoutUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getProfile); 
router.post('/logout/:email', logoutUser);

export default router;
