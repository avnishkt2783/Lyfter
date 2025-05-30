import express from "express";
import {
  offerRideDetails,
  requestRideDetails,
  matchingRides,
  matchingPassengers,
  createPassengerRide,
  getOfferedRides,
  getRequestedRides,
  getPendingRequests,
  updateRequestStatus,
  confirmRide,
  acceptedOrConfirmed,
  rideAction,
  revokeRide,
} from "../controllers/rideController.js";

const router = express.Router();

router.post("/offerRideDetails", offerRideDetails);
router.post("/requestRideDetails", requestRideDetails);
router.post("/matchingRides", matchingRides);
router.post("/matchingPassengers", matchingPassengers);
router.post("/createPassengerRide", createPassengerRide);
router.get("/yourofferedrides", getOfferedRides);
router.get("/requestedRides/:userId", getRequestedRides);
router.get("/pendingrequests/:driverRideId", getPendingRequests);
router.post("/updaterequeststatus", updateRequestStatus);
router.post("/confirm/:passengerRideId/:driverRideId", confirmRide);
router.get("/acceptedorconfirmed/:driverRideId", acceptedOrConfirmed);
router.post("/rideaction", rideAction);
router.delete("/revoke/:passengerRideId/:driverRideId", revokeRide);

export default router;
