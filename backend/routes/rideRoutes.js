import express from "express";
import { offerRide, registerPassenger, savePassengerDetails, getMatchingRides } from "../controllers/rideController.js";

const router = express.Router();

// POST /api/rides
router.post("/offerride", offerRide);
router.post("/register", registerPassenger);
router.post("/passengerdetails",savePassengerDetails);
router.post("/matchingrides", getMatchingRides)

export default router;
