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
    status,
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
      status, // Waiting, Started, Finished, Cancelled
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
        passengerName,
        passengerPhoneNo,
        startLocation,
        destination,
        seatsRequired,
      },
    });

    var savedPassengerRide;
    if (passengerRide) {
      console.log(`You have already requested a ride for this route. passengerRideId: ${passengerRide.passengerRideId}`);
      savedPassengerRide = passengerRide; 
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

    const existingPRDR = await PassengerRideDriverRide.findOne({
      where: {
        passengerRideId: savedPassengerRide.passengerRideId,
        driverRideId,
      },
    });

    var savedPRDR;
    if(existingPRDR){
      console.log(`Ride already created, Go to Your Requested Rides.`);
      savedPRDR = existingPRDR; 
    }
    else{
      savedPRDR = await PassengerRideDriverRide.create({
        passengerRideId: savedPassengerRide.passengerRideId,
        driverRideId,
        status: "Requested", //Requested, Accepted, Rejected, Confirmed
      }) 
    }

    res.status(200).json({ success: true, rideRequest: savedPassengerRide, prdr: savedPRDR });
  } catch (err) {
    console.error("❌ Error in savePassengerDetails:", err);
    res.status(500).json({ success: false, message: "Failed to save details", error: err });
  }
};

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
        status: "Waiting",
      },
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


  export const getRequestedRides = async (req, res) => {
    const userId = req.user?.userId;

    console.log("---------------------------------------------------");
    console.log("userId: " + userId);
    console.log("---------------------------------------------------");

    try {
      // Find the passenger by userId
      const passenger = await Passenger.findOne({ where: { userId } });

      console.log("---------------------------------------------------");
      console.log("Passenger object: ", passenger);
      console.log("---------------------------------------------------");

      if (!passenger) {
        return res.status(404).json({ error: "Passenger not found" });
      }

      const passengerId = passenger.passengerId;

      console.log("---------------------------------------------------");
      console.log("Passenger ID: " + passengerId);
      console.log("---------------------------------------------------");

      // Find all requested rides for the passenger
      const requestedRides = await PassengerRideDriverRide.findAll({
        attributes: ['status'], // Include the status from PassengerRideDriverRide
        include: [
          {
            model: PassengerRide,
            where: { passengerId }, // Filter by passengerId within the associated PassengerRide
            attributes: ['passengerRideId', 'startLocation', 'destination', 'seatsRequired'],
          },
          {
            model: DriverRide,
            attributes: ['startLocation', 'destination', 'fare', 'seats', 'driverId'],
            include: [
              {
                model: Driver,
                include: [
                  {
                    model: User,
                    attributes: ['fullName', 'phoneNo'],
                  },
                ],
              },
            ],
          },
        ],
      });

      console.log("---------------------------------------------------");
      console.log("Requested Rides: ", requestedRides);
      console.log("---------------------------------------------------");

      if (!requestedRides || requestedRides.length === 0) {
        return res.status(404).json({ message: "No requested rides found" });
      }

      res.status(200).json({ rides: requestedRides });
    } catch (err) {
      console.error("Error fetching requested rides:", err);
      res.status(500).json({ error: "Failed to fetch requested rides" });
    }
  };


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
     if (status === "Accepted") {
      // Update the status in the database
      await PassengerRideDriverRide.update({ status }, {
        where: { passengerRideId },
      });

      res.status(200).json({ success: true, message: "Ride accepted successfully" });
    } 
    else if (status === "Rejected") {
      // If status is 'Rejected', delete the entry from the table
     await PassengerRideDriverRide.update({ status }, {
        where: { passengerRideId },
      });

      console.log(`Request with ID ${passengerRideId} rejected.`);
       res.status(200).json({ success: true, message: "Ride rejected successfully" });
    } else {
      // Otherwise, update the status
    await PassengerRideDriverRide.update({ status }, {
      where: { passengerRideId }
    });
     console.log(`Request with ID ${passengerRideId} updated to ${status}.`);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

export const confirmRide = async (req, res) => {
  const { passengerRideId } = req.params;

  try {
    // Update the status to "Confirmed"
    await PassengerRideDriverRide.update(
      { status: "Confirmed" },
      { where: { passengerRideId } }
    );

    res.status(200).json({ success: true, message: "Ride confirmed successfully" });
  } catch (err) {
    console.error("Error confirming ride:", err);
    res.status(500).json({ error: "Failed to confirm ride" });
  }
};

// Route
export const acceptedOrConfirmed = async (req, res) => {
  const { driverRideId } = req.params;
  try {
    const rides = await PassengerRideDriverRide.findAll({
      where: {
        driverRideId,
        status: ["Accepted", "Confirmed"],
      },
      include: [
        {
          model: PassengerRide,  // The related table/model
          attributes: ['passengerName', 'passengerPhoneNo', 'startLocation', 'destination', 'seatsRequired'],
        },
      ],
    });

    res.json({ success: true, rides });
  } catch (err) {
    console.error("Error fetching accepted/confirmed rides:", err);
    res.status(500).json({ error: "Failed to fetch rides" });
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

export const revokeRide = async (req, res) => {
  const { passengerRideId } = req.params;

  try {
    const ride = await PassengerRide.findByPk(passengerRideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    await ride.destroy();
    res.status(200).json({ message: 'Ride revoked successfully' });
  } catch (error) {
    console.error('Error revoking ride:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};