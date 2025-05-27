import User from "../models/user/user.js";
import Driver from "../models/driver/driver.js";
import DriverRide from "../models/ride/driverRide.js";
import Passenger from "../models/passenger/passenger.js";
import PassengerRide from "../models/ride/passengerRide.js";
import PassengerRideDriverRide from "../models/ride/passengerRideDriverRide.js";
import { Op } from "sequelize";

// Ensure associations are defined somewhere in your model setup:
// PassengerRideDriverRide.belongsTo(PassengerRide, { foreignKey: "passengerRideId" });

export const getPlatformStats = async (req, res) => {
  try {
    // Basic counts
    const [totalUsers, totalDrivers, totalPassengers] = await Promise.all([
      User.count(),
      Driver.count(),
      Passenger.count(),
    ]);

    // Driver ride stats
    const [totalDriverRides, ongoingRides, completedRides] = await Promise.all([
      DriverRide.count(),
      DriverRide.count({ where: { status: "Started" } }),
      DriverRide.count({ where: { status: "Finished" } }),
    ]);

    // Passenger ride count
    const totalPassengerRides = await PassengerRide.count();

    // Get finished and confirmed passenger ride-driver ride pairs with seats
    const passengerRideDriverRides = await PassengerRideDriverRide.findAll({
      where: {
        status: { [Op.in]: ["Finished", "Confirmed"] },
      },
      include: {
        model: PassengerRide,
        attributes: ["seatsRequired"],
      },
    });

    // Aggregate seat-based stats
    let passengersLyfted = 0;
    let passengersInLyft = 0;

    passengerRideDriverRides.forEach((prdr) => {
      const seats = prdr.PassengerRide?.seatsRequired || 0;
      if (prdr.status === "Finished") passengersLyfted += seats;
      if (prdr.status === "Confirmed") passengersInLyft += seats;
    });

    // Send response
    res.status(200).json({
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalDriverRides,
      totalPassengerRides,
      ongoingRides,
      completedRides,
      passengersLyfted,
      passengersInLyft,
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};
