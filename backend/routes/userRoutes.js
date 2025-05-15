import express from "express";
import multer from "multer";

import { 
    loginUser,
    getProfile, 
    logoutUser, 
    updateProfile, 
    updateTheme, 
    sendOTP, 
    verifyOTP, 
    sendRegisterOTP, 
    verifyRegisterOTP, 
    resendRegisterOTP 
} from "../controllers/userController.js";

import { upload } from '../middleware/upload.js';

const router = express.Router();  

  router.post('/register/request', sendRegisterOTP);
  router.post('/register/verify', verifyRegisterOTP);
  router.post('/register/resend', resendRegisterOTP); 

router.post("/login", loginUser);
router.get("/profile", getProfile); 
router.post('/logout', logoutUser);
router.put("/profile/update", upload.single("profileImg"), updateProfile);
router.put("/users/theme", updateTheme);

router.post("/forgot-password", sendOTP);       // Send OTP
router.post("/reset-password", verifyOTP);      // Verify OTP + reset password

export default router;
