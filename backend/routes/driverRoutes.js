import express from "express";
import { upload } from "../middleware/upload.js";
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

router.post("/request", upload.single("aadharPhoto"), requestDriver);
router.post("/submit-license", upload.single("licensePhoto"), submitLicense);
router.get("/status", checkDriverStatus);
router.put("/verify/:driverId", isAdmin, verifyDriverByAdmin);
router.get("/pending", isAdmin, getPendingDrivers);
router.put("/reject/:driverId", rejectDriver);
router.get("/profile", getDriverProfile);
router.get("/aadhaar-submitted", getDriversWithAadhaar);
router.put("/verify-aadhaar/:driverId", verifyAadhaar);
router.put("/reject-aadhaar/:driverId", rejectAadhaar);

export default router;
