import User from "../models/user/user.js";
import Driver from "../models/driver/driver.js";
import DriverRide from "../models/ride/driverRide.js";
import Passenger from "../models/passenger/passenger.js";
import PassengerRide from "../models/ride/passengerRide.js";
import PassengerRideDriverRide from "../models/ride/passengerRideDriverRide.js";
import Vehicle from "../models/driver/vehicle.js";

import { Op } from "sequelize";
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
    const startLocationString =
      typeof startLocation === "string"
        ? startLocation
        : JSON.stringify(startLocation);
    const destinationString =
      typeof destination === "string"
        ? destination
        : JSON.stringify(destination);
    const routePathString =
      typeof routePath === "string" ? routePath : JSON.stringify(routePath);

    let driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      driver = await Driver.create({ userId });
    }

    await DriverRide.create({
      driverId: driver.driverId,
      vehicleId,
      startLocation: startLocationString,
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

// export const createPassengerRide = async (req, res) => {
//   const {
//     userId,
//     passengerName,
//     passengerPhoneNo,
//     startLocation,
//     destination,
//     seatsRequired,
//   } = req.body;

//   let passenger = await Passenger.findOne({ where: { userId } });
//   if (!passenger) {
//     passenger = await Passenger.create({ userId });
//   }
//   const passengerId = passenger.passengerId;

//   const passengerRide = await PassengerRide.findOne({
//     where: {
//       passengerId,
//       passengerName,
//       passengerPhoneNo,
//       startLocation,
//       destination,
//       seatsRequired,
//     },
//   });

//   var savedPassengerRide;
//   if (passengerRide) {
//     savedPassengerRide = passengerRide;
//   } else {
//     savedPassengerRide = await PassengerRide.create({
//       passengerId,
//       passengerName,
//       passengerPhoneNo,
//       startLocation,
//       destination,
//       seatsRequired,
//     });
//   }
// };

export const createPassengerRide = async (req, res) => {
  try {
    const {
      userId,
      passengerName,
      passengerPhoneNo,
      startLocation,
      destination,
      seatsRequired,
    } = req.body;

    let passenger = await Passenger.findOne({ where: { userId } });
    if (!passenger) {
      passenger = await Passenger.create({ userId });
    }
    const passengerId = passenger.passengerId;

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

    let savedPassengerRide;
    if (passengerRide) {
      savedPassengerRide = passengerRide;
    } else {
      savedPassengerRide = await PassengerRide.create({
        passengerId,
        passengerName,
        passengerPhoneNo,
        startLocation,
        destination,
        seatsRequired,
      });
    }

    // ✅ Success response
    return res.status(200).json({
      message: "Passenger ride created or found successfully",
      data: savedPassengerRide,
    });

  } catch (error) {
    console.error("Error creating passenger ride:", error);
    return res.status(500).json({
      message: "An error occurred while creating the passenger ride",
      error: error.message,
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

  try {
    let passenger = await Passenger.findOne({ where: { userId } });
    if (!passenger) {
      passenger = await Passenger.create({ userId });
    }
    const passengerId = passenger.passengerId;
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
      savedPassengerRide = passengerRide;
    } else {
      savedPassengerRide = await PassengerRide.create({
        passengerId,
        passengerName,
        passengerPhoneNo,
        startLocation,
        destination,
        seatsRequired,
      });
    }

    const existingPRDR = await PassengerRideDriverRide.findOne({
      where: {
        passengerRideId: savedPassengerRide.passengerRideId,
        driverRideId,
      },
    });

    var savedPRDR;
    if (existingPRDR) {
      savedPRDR = existingPRDR;
    } else {
      savedPRDR = await PassengerRideDriverRide.create({
        passengerRideId: savedPassengerRide.passengerRideId,
        driverRideId,
        status: "Requested", //Requested, Accepted, Rejected, Confirmed, Finished
      });
    }

    res.status(200).json({
      success: true,
      rideRequest: savedPassengerRide,
      prdr: savedPRDR,
    });
  } catch (err) {
    console.error("❌ Error in savePassengerDetails:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save details", error: err });
  }
};

export const matchingRides = async (req, res) => {
  const { passengerStart, passengerEnd, seatsRequired, currentUserId } =
    req.body;

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
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Driver,
          where: { userId: { [Op.ne]: currentUserId } },
          include: [
            {
              model: User,
              attributes: ["userId", "fullName", "phoneNo", "profileImg"],
            },
          ],
        },
        {
          model: Vehicle,
          attributes: [
            "vehicleId",
            "brand",
            "model",
            "color",
            "plateNumber",
            "vehiclePhoto",
            "vehiclePhotoPublicId",
          ],
        },
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

  if (!driverRideId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing driverRideId" });
  }

  try {
    const driverRide = await DriverRide.findByPk(driverRideId, {
      include: [
        {
          model: Driver,
          include: [
            {
              model: User,
            },
          ],
        },
      ],
    });

    if (!driverRide) {
      return res
        .status(404)
        .json({ success: false, message: "Driver ride not found" });
    }

    const driverUserId = driverRide.driver?.user?.userId;

    if (!driverUserId) {
      return res
        .status(500)
        .json({ success: false, message: "Driver's user ID not found" });
    }

    let route;
    try {
      route = JSON.parse(driverRide.routePath);

      if (!Array.isArray(route)) throw new Error();
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid routePath" });
    }

    const toleranceMeters = 200;

    const allPassengerRides = await PassengerRide.findAll({
      include: [
        {
          model: Passenger,
          include: [
            {
              model: User,
              attributes: ["userId", "fullName", "phoneNo", "profileImg"],
            },
          ],
        },
      ],
    });

    const setA = new Set();

    allPassengerRides.forEach((passengerRide) => {
      const start = JSON.parse(passengerRide.startLocation);
      const end = JSON.parse(passengerRide.destination);

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

    const setB = new Set();
    const setC = new Set();

    prdrEntries.forEach((entry) => {
      const pid = entry.passengerRideId;
      if (["Requested", "Accepted"].includes(entry.status)) {
        setB.add(pid);
      } else if (["Confirmed", "Finished"].includes(entry.status)) {
        setC.add(pid);
      }
    });

    const finalSet = new Set();

    setA.forEach((id) => {
      if (!setC.has(id)) {
        finalSet.add(id);
      }
    });

    setB.forEach((id) => finalSet.add(id));

    const driverAvailableSeats = driverRide.seats;

    const matchedPassengerRides = await PassengerRide.findAll({
      where: {
        passengerRideId: {
          [Op.in]: Array.from(finalSet),
        },
      },
      include: [
        {
          model: Passenger,
          include: [
            {
              model: User,
              attributes: ["userId", "fullName", "phoneNo", "profileImg"],
            },
          ],
        },
      ],
    });

    const filteredRides = matchedPassengerRides.filter((ride) => {
      const isNotSameUser = ride.passenger?.user?.userId !== driverUserId;
      const seatsOkay = ride.seatsRequired <= driverAvailableSeats;
      return isNotSameUser && seatsOkay;
    });

    res.status(200).json({ success: true, passengers: filteredRides });
  } catch (err) {
    console.error("❌ Error in matchingPassengers:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

export const getOfferedRides = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) {
      return res.status(401).json({ error: "Unauthorized: Driver not found" });
    }

    const driverId = driver.driverId;
    const rides = await DriverRide.findAll({
      where: { driverId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: PassengerRideDriverRide,
          attributes: ["status"],
          where: { status: "Requested" },
          required: false,
          include: [
            {
              model: PassengerRide,
              attributes: ["passengerRideId"],
            },
          ],
        },
        {
          model: Vehicle,
        },
      ],
    });

    const rideData = rides.map((ride) => {
      const pendingRequests = Array.isArray(ride.passengerRideDriverRides)
        ? ride.passengerRideDriverRides.length
        : 0;
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

  try {
    const passenger = await Passenger.findOne({ where: { userId } });

    if (!passenger) {
      return res.status(404).json({ error: "Passenger not found" });
    }

    const passengerId = passenger.passengerId;
    const requestedRides = await PassengerRideDriverRide.findAll({
      attributes: ["status"],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: PassengerRide,
          where: { passengerId },
          attributes: [
            "passengerRideId",
            "startLocation",
            "destination",
            "seatsRequired",
          ],
        },
        {
          model: DriverRide,
          attributes: [
            "driverRideId",
            "startLocation",
            "destination",
            "fare",
            "seats",
            "driverId",
            "departureTime",
          ],
          include: [
            {
              model: Driver,
              include: [
                {
                  model: User,
                  attributes: [
                    "fullName",
                    "phoneNo",
                    "profileImg",
                    "isVerified",
                  ],
                },
              ],
            },
            {
              model: Vehicle,
            },
          ],
        },
      ],
    });
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

    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) {
      console.error("❌ Unauthorized: Driver not found");
      return res.status(401).json({ error: "Unauthorized: Driver not found" });
    }

    if (!driverRideId) {
      console.error("❌ Missing driverRideId");
      return res
        .status(400)
        .json({ error: "Invalid request: Missing driverRideId" });
    }

    const requests = await PassengerRideDriverRide.findAll({
      where: { driverRideId, status: "Requested" },
      include: [
        {
          model: PassengerRide,
          attributes: [
            "passengerRideId",
            "passengerName",
            "passengerPhoneNo",
            "startLocation",
            "destination",
            "seatsRequired",
          ],
        },
      ],
    });

    if (!requests || requests.length === 0) {
      console.warn(
        `🚫 No pending requests found for driverRideId: ${driverRideId}`
      );
      return res.status(404).json({ error: "No pending requests found" });
    }

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
      return res
        .status(400)
        .json({ error: "passengerRideId and driverRideId are required" });
    }

    await PassengerRideDriverRide.update(
      { status },
      {
        where: {
          passengerRideId,
          driverRideId,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `Ride ${status.toLowerCase()} successfully`,
    });
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
          model: PassengerRide,
          attributes: [
            "passengerName",
            "passengerPhoneNo",
            "startLocation",
            "destination",
            "seatsRequired",
          ],
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
      return res.status(404).json({ message: "Ride request not found" });
    }

    await request.destroy();
    res.status(200).json({ message: "Ride request revoked successfully" });
  } catch (error) {
    console.error("Error revoking ride request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
