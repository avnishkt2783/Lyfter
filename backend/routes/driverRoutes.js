import express from "express";
import { upload } from "../middleware/upload.js";
import authenticate from "../middleware/authenticate.js";
import { isAdmin } from "../middleware/isAdmin.js";

import {
  requestDriver,
  submitLicense,
  checkDriverStatus,
  verifyDriverByAdmin,
  getPendingDrivers,
  getDriverProfile,
  rejectDriver,
  getDriversWithAadhaar,
  verifyAadhaar,
  rejectAadhaar,
} from "../controllers/driverController.js";

const router = express.Router();

// Become a driver (Aadhar only)
router.post("/request", upload.single("aadharPhoto"), requestDriver);

// Submit License (after Aadhar)
router.post("/submit-license", upload.single("licensePhoto"), submitLicense);

// Check driver verification status
router.get("/status", checkDriverStatus);

// ADMIN: Verify driver manually
router.put("/verify/:driverId", isAdmin, verifyDriverByAdmin);

// List of all pending drivers (admin only)
router.get("/pending", isAdmin, getPendingDrivers);

router.put('/reject/:driverId', rejectDriver);

router.get("/profile", getDriverProfile);

// Get all drivers who have submitted Aadhaar & photo and are pending verification
router.get("/aadhaar-submitted", getDriversWithAadhaar);

router.put('/verify-aadhaar/:driverId', verifyAadhaar);
router.put('/reject-aadhaar/:driverId', rejectAadhaar);

export default router;