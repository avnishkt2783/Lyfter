import Driver from "../models/driver/driver.js";
import Ride from "../models/ride/ride.js";
import PassengerRide from "../models/ride/passengerRide.js";
import Passenger from "../models/passenger/passenger.js";
import User from "../models/user/user.js";

import { Op } from 'sequelize';
import haversine from "haversine-distance";

export const offerRide = async (req, res) => {
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

    await Ride.create({
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

export const registerPassenger = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if already registered as passenger
    const existingPassenger = await Passenger.findOne({ where: { userId } });
    if (existingPassenger) {
      return res.status(200).json({ success: true, message: "User already registered as passenger." });
    }

    // Create passenger entry
    const newPassenger = await Passenger.create({ userId });

    res.status(201).json({ success: true, passenger: newPassenger });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to register passenger", error });
  }
};

export const savePassengerDetails = async (req, res) => {
  // console.log("Request Body:", req.body);
  // Fetch the passengerId related to the user
// const passenger = await Passenger.findOne({ where: { userId } });

const userId = req.user.userId;
  const {
    name,
    phone,
    startLocation,
    destination,
    seatsRequired,
  } = req.body;
  try {

    const passenger = await Passenger.findOne({ where: { userId } });

    if (!passenger) {
      return res.status(404).json({ success: false, message: "Passenger not found" });
    }

    const saved = await PassengerRide.create({
      passengerId:passenger.passengerId,
      name,
      phone,
      startLocation,
      destination,
      seatsRequired,
    });

    res.status(200).json({ success: true, rideRequest: saved });
  } catch (err) {
    console.error("❌ Error in savePassengerDetails:", err);
    res.status(500).json({ success: false, message: "Failed to save details", error: err });
  }
};

export const getMatchingRides = async (req, res) => {
  const { passengerStart, passengerEnd, seatsRequired = 1 } = req.body;

  // console.log("Incoming Body:", req.body);

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
    const allRides = await Ride.findAll({
      where: {
        seats: {
          [Op.gte]: parseInt(seatsRequired),
        },
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
