import express from "express";
import { 
    offerRideDetails,
    requestRideDetails, 
    matchingRides, 
    getOfferedRides, 
    getRequestedRides, 
    getPendingRequests, 
    updateRequestStatus, 
    rideAction 
} from "../controllers/rideController.js";

const router = express.Router();

// POST /api/rides
router.post("/offerRideDetails", offerRideDetails);
router.post("/requestRideDetails",requestRideDetails);
router.post("/matchingRides", matchingRides);

router.get("/yourofferedrides", getOfferedRides);  // Fetch all rides offered by a driver

// GET /api/rides/requestedRides/:userId
router.get("/requestedRides/:userId", getRequestedRides);  // <-- Add this line

// GET /api/rides/pending-requests/:driverRideId
router.get("/pendingrequests/:driverRideId", getPendingRequests);  // Get pending requests for a ride

// POST /api/rides/update-request-status
router.post("/updaterequeststatus", updateRequestStatus);  // Update request status (Accepted or Rejected)

// POST /api/rides/ride-action
router.post("/rideaction", rideAction);  // Action (Start, Cancel, Finish Ride)

export default router;
