import express from "express";
import { offerRide } from "../controllers/rideController.js";

const router = express.Router();

// POST /api/rides
router.post("/offerride", offerRide);

export default router;
