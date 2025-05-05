import express from "express";
import { offerRide,registerPassenger,savePassengerDetails} from "../controllers/rideController.js";

const router = express.Router();

// POST /api/rides
router.post("/offerride", offerRide);
router.post("/register", registerPassenger);
router.post("/passengerdetails",savePassengerDetails)
export default router;
