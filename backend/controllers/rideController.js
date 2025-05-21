import User from "../models/user/user.js";
import Driver from "../models/driver/driver.js";
import DriverRide from "../models/ride/driverRide.js";
import Passenger from "../models/passenger/passenger.js";
import PassengerRide from "../models/ride/passengerRide.js";
import PassengerRideDriverRide from "../models/ride/passengerRideDriverRide.js";
import Vehicle from "../models/driver/vehicle.js";

import { Op } from 'sequelize';
import haversine from "haversine-distance";

export const offerRideDetails = async (req, res) => {
  const {
    userId,
    vehicleId,
    startLocation,
    destination,
    seats,
    fare,
    departureTime,
    routePath,
    status,
  } = req.body;

  try {
    // Convert startLocation and destination to JSON strings if necessary
    const startLocationString = 
      typeof startLocation === "string" ? startLocation : JSON.stringify(startLocation);
    const destinationString = 
      typeof destination === "string" ? destination : JSON.stringify(destination);
    const routePathString =
      typeof routePath === "string" ? routePath : JSON.stringify(routePath);

    let driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      driver = await Driver.create({ userId });
    }

    await DriverRide.create({
      driverId: driver.driverId,
      vehicleId,
      startLocation:startLocationString,
      destination: destinationString,
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

export const createPassengerRide = async (req, res) => {
  const {
      userId,
      passengerName,
      passengerPhoneNo,
      startLocation,
      destination,
      seatsRequired,
      // driverRideId,
  } = req.body;

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
      // console.log(`You have already requested a ride for this route. passengerRideId: ${passengerRide.passengerRideId}`);
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

  // console.log("------------------------------------------------------------------");
  // console.log("Checking if its recieved or not.. ", passengerPhoneNo);
  // console.log("------------------------------------------------------------------");
  
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
      // console.log(`You have already requested a ride for this route. passengerRideId: ${passengerRide.passengerRideId}`);
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
    // console.log(savedPassengerRide.passengerRideId);

    const existingPRDR = await PassengerRideDriverRide.findOne({
      where: {
        passengerRideId: savedPassengerRide.passengerRideId,
        driverRideId,
      },
    });

    var savedPRDR;
    if(existingPRDR){
      // console.log(`Ride already created, Go to Your Requested Rides.`);
      savedPRDR = existingPRDR; 
    }
    else{
      savedPRDR = await PassengerRideDriverRide.create({
        passengerRideId: savedPassengerRide.passengerRideId,
        driverRideId,
        status: "Requested", //Requested, Accepted, Rejected, Confirmed, Finished
      }) 
    }

    res.status(200).json({ success: true, rideRequest: savedPassengerRide, prdr: savedPRDR });
  } catch (err) {
    console.error("❌ Error in savePassengerDetails:", err);
    res.status(500).json({ success: false, message: "Failed to save details", error: err });
  }
};

export const matchingRides = async (req, res) => {
  const { passengerStart, passengerEnd, seatsRequired, currentUserId } = req.body;

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
    seats: { [Op.gte]: parseInt(seatsRequired) },
    status: "Waiting",
  },
  order: [['createdAt', 'DESC']],
  include: [
    {
      model: Driver,
      where: { userId: { [Op.ne]: currentUserId } },  // <-- exclude rides by current user
      include: [
        {
          model: User,
          attributes: ["userId", "fullName", "phoneNo", "profileImg"],
          // no where here, just attributes
        },
      ],
    },
    {
      model: Vehicle, // Include the vehicle details here
      attributes: [
        "vehicleId",
        "brand",
        "model",
        "color",
        "plateNumber",
        "vehiclePhoto",
        "vehiclePhotoPublicId"
      ],
    }
  ],
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

export const matchingPassengers = async (req, res) => {
  const { driverRideId } = req.body;

  console.log("----------");
  console.log("driverRideId", driverRideId);  

  if (!driverRideId) {
    return res.status(400).json({ success: false, message: "Missing driverRideId" });
  }

  try {
    // 1. Get the specific driver ride and route path
    const driverRide = await DriverRide.findByPk(driverRideId, {
      include: [
        {
          model: Driver,
          include: [
            {
              model: User,
              // attributes: ['userId', 'fullName', 'email'] // Whatever you need
            }
          ]
        }
      ]
    });

  // console.log("----------");
  // console.log("driverRide", driverRide);

    if (!driverRide) {
      return res.status(404).json({ success: false, message: "Driver ride not found" });
    }

    const driverUserId = driverRide.driver?.user?.userId;
    // console.log("----------");
    // console.log("driverUserId", driverUserId);
    // console.log("----------");
    // console.dir(driverRide.toJSON(), { depth: null });

    if (!driverUserId) {
      return res.status(500).json({ success: false, message: "Driver's user ID not found" });
    }


    let route;
    try {
      route = JSON.parse(driverRide.routePath);

  // console.log("----------");
  //     console.log("route", route);
  // console.log("----------");
  //     console.log("!Array.isArray(route)", !Array.isArray(route));

      if (!Array.isArray(route)) throw new Error();
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid routePath" });
    }

    const toleranceMeters = 200;

    const allPassengerRides = await PassengerRide.findAll({
      include: [{
        model: Passenger,
        include: [{
          model: User,
          attributes: ["userId", "fullName", "phoneNo", "profileImg"]
        }]
      }]
    });

  // console.log("----------");
  //   console.log("allPassengerRides", allPassengerRides); // i get all rides till here. 
  // 3. Build Set A: PassengerRides that match the route
  const setA = new Set();
  
  allPassengerRides.forEach((passengerRide) => {
      // const start = passengerRide.startLocation;
      // const end = passengerRide.destination;
      const start = JSON.parse(passengerRide.startLocation);
      const end = JSON.parse(passengerRide.destination);
      
      
      // console.log("----------");
      // console.log("start", start);
      // console.log("end", end);
      

      if (!start || !end) return;

      let startIndex = -1;
      let endIndex = -1;

      route.forEach((point, index) => {
        const distToStart = haversine(start, point);
        const distToEnd = haversine(end, point);
        if (distToStart < toleranceMeters && startIndex === -1) {
          startIndex = index;
        }
        if (distToEnd < toleranceMeters && endIndex === -1) {
          endIndex = index;
        }
      });

      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        setA.add(passengerRide.passengerRideId);
      }
    });

    const prdrEntries = await PassengerRideDriverRide.findAll({
      where: {
        passengerRideId: Array.from(setA),
      },
    });


    console.log("----------");
console.log("A",setA);

  console.log("----------");
    console.log("prdrEntries", prdrEntries);


    // 5. Create Set B and Set C
    const setB = new Set(); // status: requested, accepted
    const setC = new Set(); // status: confirmed, finished

    prdrEntries.forEach((entry) => {
      const pid = entry.passengerRideId;
      if (["Requested", "Accepted"].includes(entry.status)) {
        setB.add(pid);
      } else if (["Confirmed", "Finished"].includes(entry.status)) {
        setC.add(pid);
      }
    });

    
    console.log("----------");
console.log("B",setB);
    console.log("----------");
console.log("C",setC);

    // 6. Compute (A - C) ∪ B
    const finalSet = new Set();

    // A - C
    setA.forEach((id) => {
      if (!setC.has(id)) {
        finalSet.add(id);
      }
    });

    // ∪ B
    setB.forEach((id) => finalSet.add(id));    
    
    console.log("----------");
console.log("finalSet",finalSet);

    // 7. Fetch relevant PassengerRide data for result
    const matchedPassengerRides = await PassengerRide.findAll({
      where: {
        passengerRideId: {
          [Op.in]: Array.from(finalSet),
        },
      },
      include: [{
        model: Passenger,
        include: [{
          model: User,
          attributes: ["userId", "fullName", "phoneNo", "profileImg"]
        }]
      }]
    });

  // console.log("----------");
  // console.log("matchedPassengerRides", matchedPassengerRides[0].passenger?.);
  
  // 8. Filter out passenger rides where passenger userId matches the driver userId
  
  // console.log("----------");
  // console.log("driverUserId", driverUserId);  
  // console.log("EQUALS OR NOT EQUALS");
  // console.log("matchedPassengerRides[0].Passenger?.User?.userId", matchedPassengerRides[0].Passenger?.User?.userId);
  const filteredRides = matchedPassengerRides.filter(
      (ride) => ride.passenger?.user?.userId !== driverUserId
    );

  // console.log("----------");
  //   console.log("filteredRides", filteredRides);

    res.status(200).json({ success: true, passengers: filteredRides });
  } catch (err) {
    console.error("❌ Error in matchingPassengers:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

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
                {
      model: Vehicle, // Include vehicle directly with DriverRide
      // attributes: ['vehicleId', 'brand', 'model', 'color', 'plateNumber', 'vehiclePhoto'],
    },
            ],
    });

    // For each ride, count the pending requests
      const rideData = rides.map(ride => {
            const pendingRequests = Array.isArray(ride.passengerRideDriverRides) ? ride.passengerRideDriverRides.length : 0;
            //  console.log(`Ride ID: ${ride.driverRideId}, Pending Requests: ${pendingRequests}`);
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

  // console.log("---------------------------------------------------");
  // console.log("userId: " + userId);
  // console.log("---------------------------------------------------");

  try {
    // Find the passenger by userId
    const passenger = await Passenger.findOne({ where: { userId } });

    // console.log("---------------------------------------------------");
    // console.log("Passenger object: ", passenger);
    // console.log("---------------------------------------------------");

    if (!passenger) {
      return res.status(404).json({ error: "Passenger not found" });
    }

    const passengerId = passenger.passengerId;

    // console.log("---------------------------------------------------");
    // console.log("Passenger ID: " + passengerId);
    // console.log("---------------------------------------------------");

    // Find all requested rides for the passenger
    const requestedRides = await PassengerRideDriverRide.findAll({
      attributes: ['status'], // Include the status from PassengerRideDriverRide
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: PassengerRide,
          where: { passengerId }, // Filter by passengerId within the associated PassengerRide
          attributes: ['passengerRideId', 'startLocation', 'destination', 'seatsRequired'],
        },
        {
          model: DriverRide,
          attributes: ['driverRideId','startLocation', 'destination', 'fare', 'seats', 'driverId', 'departureTime'],
          include: [
            {
              model: Driver,
              include: [
                {
                  model: User,
                  attributes: ['fullName', 'phoneNo', 'profileImg', 'isVerified'],
                },
              ],
            },
            {
              model: Vehicle, // 👈 Vehicle model inclusion
              // attributes: ['vehicleNumber', 'vehicleModel', 'vehicleType', 'vehicleColor'],
            },
          ],
        },
      ],
    });

    // console.log("---------------------------------------------------");
    // console.log("Requested Rides: ", requestedRides);
    // console.log("---------------------------------------------------");

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

    // console.log(`✅ Fetching pending requests for driverRideId: ${driverRideId}`);

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

    // console.log("✅ Raw Pending Requests: ", JSON.stringify(requests, null, 2));

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

    // console.log("✅ Fetched Pending Requests: ", pendingRequests);
    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(404).json({ message: "No pending requests found" });
    }

    res.status(200).json({ requests: pendingRequests });
  } catch (err) {
    console.error("Error fetching pending requests:", err.message);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

export const updateRequestStatus = async (req, res) => {
  const { passengerRideId, driverRideId, status } = req.body;

  try {
    if (!passengerRideId || !driverRideId) {
      return res.status(400).json({ error: "passengerRideId and driverRideId are required" });
    }

    // Update the status in the database
    await PassengerRideDriverRide.update(
      { status },
      {
        where: {
          passengerRideId,
          driverRideId,
        },
      }
    );

    // console.log(`Request with passengerRideId ${passengerRideId} and driverRideId ${driverRideId} updated to ${status}.`);
    res.status(200).json({ success: true, message: `Ride ${status.toLowerCase()} successfully` });

  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

export const confirmRide = async (req, res) => {
  const { passengerRideId, driverRideId } = req.params;

  try {
    const ride = await PassengerRideDriverRide.findOne({
      where: { passengerRideId, driverRideId },
      include: [
        { model: PassengerRide, as: "passengerRide" },
        { model: DriverRide, as: "driverRide" },
      ],
    });

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    const seatsRequested = ride.passengerRide?.seatsRequired;
    const availableSeats = ride.driverRide?.seats;

    if (availableSeats < seatsRequested) {
      return res.status(400).json({
        error: "Insufficient seats available",
        availableSeats,
      });
    }

    // Deduct seats and confirm the ride
    await ride.driverRide.update({
      seats: availableSeats - seatsRequested,
    });

    await ride.update({
      status: "Confirmed",
    });

    return res.status(200).json({ success: true, message: "Ride confirmed" });
  } catch (err) {
    console.error("Error confirming ride backend:", err);
    return res.status(500).json({ error: "Failed to confirm ride" });
  }
};

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

export const rideAction = async (req, res) => {
  const { driverRideId, action } = req.body;

  try {
    const ride = await DriverRide.findByPk(driverRideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (action === "Start Ride") {
      ride.status = "Started";
      await ride.save();

      // Update passengerRideDriverRide statuses
      await PassengerRideDriverRide.update(
        { status: "Rejected" },
        {
          where: {
            driverRideId,
            status: { [Op.ne]: "Confirmed" },
          },
        }
      );
    } else if (action === "Cancel Ride") {
      ride.status = "Cancelled";
      await ride.save();

      await PassengerRideDriverRide.update(
        { status: "Rejected" },
        { where: { driverRideId } }
      );
    } else if (action === "Finish Ride") {
      ride.status = "Finished";
      await ride.save();

      await PassengerRideDriverRide.update(
        { status: "Finished" },
        { where: { driverRideId, status: "Confirmed" } }
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error performing ride action:", err);
    res.status(500).json({ error: "Failed to perform ride action" });
  }
};

export const revokeRide = async (req, res) => {
  const { passengerRideId, driverRideId } = req.params;

  try {
    const request = await PassengerRideDriverRide.findOne({
      where: { passengerRideId, driverRideId },
    });

    if (!request) {
      return res.status(404).json({ message: 'Ride request not found' });
    }

    await request.destroy();
    res.status(200).json({ message: 'Ride request revoked successfully' });
  } catch (error) {
    console.error('Error revoking ride request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};