import User from "../models/user/user.js";
import Driver from "../models/driver/driver.js";
import DriverRide from "../models/ride/driverRide.js";
import Passenger from "../models/passenger/passenger.js";
import PassengerRide from "../models/ride/passengerRide.js";
import PassengerRideDriverRide from "../models/ride/passengerRideDriverRide.js";

import { Op } from 'sequelize';
import haversine from "haversine-distance";

export const offerRideDetails = async (req, res) => {
  const {
    userId,
    mode,
    startLocation,
    destination,
    seats,
    fare,
    departureTime,
    routePath,
  } = req.body;

  try {
    const routePathString =
      typeof routePath === "string" ? routePath : JSON.stringify(routePath);

    let driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      driver = await Driver.create({ userId });
    }

    await DriverRide.create({
      driverId: driver.driverId,
      mode,
      startLocation,
      destination,
      seats,
      fare,
      departureTime,
      routePath: routePathString,
    });

    res.status(200).json({ message: "Ride offered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to offer ride" });
  }
};

export const requestRideDetails = async (req, res) => {
  const {
    userId,
    passengerName,
    passengerPhoneNo,
    startLocation,
    destination,
    seatsRequired,
    driverRideId,
  } = req.body;
  try {
    let passenger = await Passenger.findOne({ where: { userId } });
    if (!passenger) {
      passenger = await Passenger.create({ userId });
    }
    const passengerId = passenger.passengerId;

    // Check for an existing request with the same route
    const passengerRide = await PassengerRide.findOne({
      where: {
        passengerId,
        startLocation,
        destination,
      },
    });

    var savedPassengerRide;
    if (passengerRide) {
      // return res.status(409).json({
        // success: false,
        console.log(`You have already requested a ride for this route. passengerRideId: ${passengerRide.passengerRideId}`);
         savedPassengerRide = passengerRide; // <-- Add this line
      // });
    }
else{
    savedPassengerRide = await PassengerRide.create({
      passengerId,
      passengerName,
      passengerPhoneNo,
      startLocation,
      destination,
      seatsRequired,
    });
  }
console.log(savedPassengerRide.passengerRideId);
    const savedPRDR = await PassengerRideDriverRide.create({
      passengerRideId: savedPassengerRide.passengerRideId,
      driverRideId,
      status: "Requested", //Requested, Accepted, Confirmed
    }) 

    res.status(200).json({ success: true, rideRequest: savedPassengerRide, prdr: savedPRDR });
  } catch (err) {
    console.error("❌ Error in savePassengerDetails:", err);
    res.status(500).json({ success: false, message: "Failed to save details", error: err });
  }
};

// export const createPassengerRideDriverRide = async (req, res) => {
//   // CODE FOR CREATION OF PASSENGER RIDE AND DRIVER RIDE.
// };

export const matchingRides = async (req, res) => {
  const { passengerStart, passengerEnd, seatsRequired } = req.body;

  if (
    !passengerStart?.lat ||
    !passengerStart?.lng ||
    !passengerEnd?.lat ||
    !passengerEnd?.lng
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing start or destination coordinates",
    });
  }

  try {
    const allRides = await DriverRide.findAll({
      where: {
        seats: {
          [Op.gte]: parseInt(seatsRequired),
        },
      },
      // FIX THIS CODE. TO AVOID THE TABLE JOINING FOR INFO SHARING.
      include: [
        {
          model: Driver,
          include: [
            {
              model: User,
              attributes: ["fullName", "phoneNo"],
            },
          ],
        },
      ]
    });

    const toleranceMeters = 200;

    const matchingRides = allRides.filter((row) => {
      let route;
      try {
        route = JSON.parse(row.routePath);
        if (!Array.isArray(route)) return false;
      } catch (e) {
        console.warn("🚫 Invalid routePath for rideId:", row.rideId);
        return false;
      }

      let startIndex = -1;
      let endIndex = -1;

      route.forEach((point, index) => {
        const distToStart = haversine(passengerStart, point);
        const distToEnd = haversine(passengerEnd, point);
        if (distToStart < toleranceMeters && startIndex === -1) {
          startIndex = index;
        }
        if (distToEnd < toleranceMeters && endIndex === -1) {
          endIndex = index;
        }
      });

      return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    });

    res.status(200).json({ success: true, rides: matchingRides });
  } catch (err) {
    console.error("❌ Error in getMatchingRides:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching rides",
      error: err.message || err,
    });
  }
};


// Controller to get all offered rides for the driver
export const getOfferedRides = async (req, res) => {

  try {
     const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        // Find driverId from userId
        const driver = await Driver.findOne({ where: { userId } });

        if (!driver) {
            return res.status(401).json({ error: "Unauthorized: Driver not found" });
        }

        const driverId = driver.driverId;
    const rides = await DriverRide.findAll({
      where: { driverId },
      order: [['createdAt', 'DESC']], // Order by creation date (newest first)
        include: [
                {
                    model: PassengerRideDriverRide,
                    attributes: ['status'],
                    where: { status: 'Requested' },
                    required: false,
                    include: [
                        {
                            model: PassengerRide,
                            attributes: ['passengerRideId'],
                        },
                    ],
                },
            ],
    });

    // For each ride, count the pending requests
      const rideData = rides.map(ride => {
            const pendingRequests = Array.isArray(ride.passengerRideDriverRides) ? ride.passengerRideDriverRides.length : 0;
             console.log(`Ride ID: ${ride.driverRideId}, Pending Requests: ${pendingRequests}`);
            return { ...ride.dataValues, pendingRequests };
        });

        res.status(200).json({ rides: rideData });
  } catch (err) {
    console.error("Error fetching offered rides:", err);
    res.status(500).json({ error: "Failed to fetch offered rides" });
  }
};

// Get pending requests for a specific ride
export const getPendingRequests = async (req, res) => {
  
  try {
    const userId = req.user?.userId;
     const driverRideId = req.params.driverRideId;

        if (!userId) {
           console.error("❌ Unauthorized: User not found");
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        // Find driverId from userId
        const driver = await Driver.findOne({ where: { userId } });

        if (!driver) {
           console.error("❌ Unauthorized: Driver not found");
            return res.status(401).json({ error: "Unauthorized: Driver not found" });
        }

          // Validate the driverRideId
    if (!driverRideId) {
      console.error("❌ Missing driverRideId");
      return res.status(400).json({ error: "Invalid request: Missing driverRideId" });
    }

    console.log(`✅ Fetching pending requests for driverRideId: ${driverRideId}`);

        // const driverId = driver.driverId;
        // const driverRideId = await DriverRide.findOne({ where: { driverId }})
    const requests = await PassengerRideDriverRide.findAll({
      where: { driverRideId, status: 'Requested' },
      include: [
    {
      model: PassengerRide,
       attributes: ['passengerRideId', 'passengerName', 'passengerPhoneNo', 'startLocation', 'destination', 'seatsRequired'], // Directly from passengerRide table
    }
  ]
    });

    console.log("✅ Raw Pending Requests: ", JSON.stringify(requests, null, 2));

     // Check if the requests array is empty or contains null entries
    if (!requests || requests.length === 0) {
      console.warn(`🚫 No pending requests found for driverRideId: ${driverRideId}`);
      return res.status(404).json({ error: "No pending requests found" });
    }

     // Map the results properly
    const pendingRequests = requests.map((request) => {
      return {
        passengerRideId: request.passengerRide?.passengerRideId || "N/A",
        passengerName: request.passengerRide?.passengerName || "Unknown",
        passengerPhoneNo: request.passengerRide?.passengerPhoneNo || "N/A",
        startLocation: request.passengerRide?.startLocation || "N/A",
        destination: request.passengerRide?.destination || "N/A",
        seatsRequired: request.passengerRide?.seatsRequired || 0,
      };
    });

    console.log("✅ Fetched Pending Requests: ", pendingRequests);
    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(404).json({ message: "No pending requests found" });
    }

    res.status(200).json({ requests: pendingRequests });
  } catch (err) {
    console.error("Error fetching pending requests:", err.message);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

// Update request status (Accept/Reject)
export const updateRequestStatus = async (req, res) => {
  const { passengerRideId, status } = req.body;
  
  try {
    await PassengerRideDriverRide.update({ status }, {
      where: { passengerRideId }
    });
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

// Handle ride actions (Start, Cancel, Finish)
export const rideAction = async (req, res) => {
  const { driverRideId, action } = req.body;

  try {
    // Implement logic based on action
    if (action === "Start Ride") {
      // Update ride status to started or other logic
    } else if (action === "Cancel Ride") {
      // Cancel the ride
    } else if (action === "Finish Ride") {
      // Mark the ride as finished
    }
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error performing ride action:", err);
    res.status(500).json({ error: "Failed to perform ride action" });
  }
};