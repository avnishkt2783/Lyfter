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
