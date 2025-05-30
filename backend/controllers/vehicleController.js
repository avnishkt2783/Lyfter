import Vehicle from "../models/driver/vehicle.js";
import Driver from "../models/driver/driver.js";

export const addVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) {
      return res.status(403).json({ message: "Driver not found" });
    }

    const { brand, model, color, plateNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Vehicle photo is required." });
    }

    const vehiclePhoto = req.file.path;
    const vehiclePhotoPublicId = req.file.filename;

    if (!brand || !model || !color || !plateNumber) {
      return res
        .status(400)
        .json({ message: "All vehicle fields are required." });
    }

    const existingVehicle = await Vehicle.findOne({ where: { plateNumber } });
    if (existingVehicle) {
      return res.status(400).json({ message: "Plate number already exists." });
    }

    await Vehicle.create({
      driverId: driver.driverId,
      brand,
      model,
      color,
      plateNumber,
      vehiclePhoto,
      vehiclePhotoPublicId,
    });

    res.status(201).json({ message: "Vehicle added successfully." });
  } catch (err) {
    console.error("Add Vehicle Error:", err);
    res.status(500).json({ message: "Failed to add vehicle." });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.params;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    const vehicle = await Vehicle.findOne({
      where: { vehicleId, driverId: driver.driverId },
    });
    if (!vehicle) {
      return res
        .status(404)
        .json({ message: "Vehicle not found or unauthorized." });
    }

    await Vehicle.destroy({ where: { vehicleId } });

    res.json({ message: "Vehicle deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete vehicle." });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const userId = req.user.id;

    const driver = await Driver.findOne({ where: { userId: userId } });

    if (!driver) {
      return res.status(200).json({
        isDriver: false,
        vehicles: [],
      });
    }

    const vehicles = await Vehicle.findAll({
      where: { driverId: driver.driverId },
    });

    res.status(200).json({
      isDriver: true,
      vehicles,
    });
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};
