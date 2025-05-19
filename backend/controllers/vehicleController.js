import Vehicle from "../models/driver/vehicle.js";
import Driver from "../models/driver/driver.js";


export const addVehicle = async (req, res) => {
  try {
    const userId = req.user.id; // pulled from token
    const driver = await Driver.findOne({ where: { userId } });


    if (!driver) {
      return res.status(403).json({ message: "Driver not found" });
    }


    const { brand, model, color, plateNumber } = req.body;
    const vehiclePhoto = req.file?.filename;


    if (!brand || !model || !color || !plateNumber || !vehiclePhoto) {
      return res.status(400).json({ message: "All vehicle fields required." });
    }
   // Check for existing plate number
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
    });


    res.status(201).json({ message: "Vehicle added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add vehicle." });
  }
};


// Delete vehicle by vehicleId
export const deleteVehicle = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const { vehicleId } = req.params;


    // Find driver by userId
    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }


    // Find vehicle with vehicleId and ensure it belongs to this driver
    const vehicle = await Vehicle.findOne({ where: { vehicleId, driverId: driver.driverId } });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found or unauthorized." });
    }


    // Delete vehicle
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
    // console.log("-----");
    // console.log(userId);    
    // console.log("-----");

    const driver =  await Driver.findOne({ where: { userId: userId }});
    
    const vehicles = await Vehicle.findAll({ where: { driverId: driver.driverId } });
    
    // console.log("-----");
    // console.log(vehicles);
    // console.log("-----");
    
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};