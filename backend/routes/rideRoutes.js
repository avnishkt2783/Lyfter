import express from "express";
import { offerRideDetails, requestRideDetails, matchingRides } from "../controllers/rideController.js";

const router = express.Router();

// POST /api/rides
router.post("/offerRideDetails", offerRideDetails);
router.post("/requestRideDetails",requestRideDetails);
router.post("/matchingRides", matchingRides)
// router.post("/createPassengerRideDriverRide", createPassengerRideDriverRide)

export default router;
