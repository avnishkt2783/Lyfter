import express from "express";
import multer from "multer";

import { registerUser, loginUser, getProfile, logoutUser, updateProfile } from "../controllers/userController.js";
import { upload } from '../middleware/upload.js';

const router = express.Router();  

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getProfile); 
router.post('/logout', logoutUser);
router.put("/profile/update", upload.single("profileImg"), updateProfile);

export default router;
