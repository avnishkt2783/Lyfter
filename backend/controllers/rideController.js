import Driver from "../models/driver/driver.js";
import Ride from "../models/ride/ride.js";

export const offerRide = async (req, res) => {
  const {
    userId,
    name,
    phone,
    mode,
    startLocation,
    destination,
    seats,
    fare,
    departureTime,
  } = req.body;

  try {
    // Check if driver exists or create a new one
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
    });

    res.status(200).json({ message: "Ride offered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to offer ride" });
  }
};
