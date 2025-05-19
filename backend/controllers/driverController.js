import Driver from "../models/driver/driver.js";
import User from "../models/user/user.js";
import Vehicle from "../models/driver/vehicle.js";
import { Op } from "sequelize";
import fs from 'fs';
import path from 'path';

export const requestDriver = async (req, res) => {
  try {
    console.log("DEBUG user", req.user);      // <— add
    const userId = req?.user?.id;             // safe-chain
    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    const { aadharNumber } = req.body;

    const aadharPhoto = req.file?.filename;
    if (!aadharNumber || !aadharPhoto) {
      return res.status(400).json({ message: "Aadhar details required." });
    }

    const existing = await Driver.findOne({ where: { userId } });
    if (existing) return res.status(400).json({ message: "Already requested." });

    await Driver.create({ userId, aadharNumber, aadharPhoto });
    res.status(201).json({ message: "Driver request submitted." });
  } catch (err) {
    console.error("❌ Driver request failed:", err);
    res.status(500).json({ message: "Driver request failed." });
  }
};

export const submitLicense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { licenseNumber } = req.body;
    const licensePhoto = req.file?.filename;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) return res.status(404).json({ message: "Not a driver yet." });

    driver.licenseNumber = licenseNumber;
    driver.licensePhoto = licensePhoto;

    await driver.save();
    res.status(200).json({ message: "License submitted. Awaiting admin verification." });
  } catch (err) {
    res.status(500).json({ message: "License upload failed." });
  }
};

export const checkDriverStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) {
      // User is not a driver at all
      return res.status(404).json({ message: "Not a driver." });
    }

    // Return all required fields for frontend to decide status
    res.json({
      aadharNumber: driver.aadharNumber || null,
      licenseNumber: driver.licenseNumber || null,
      isVerified: driver.isVerified || false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to check status." });
  }
};

export const verifyDriverByAdmin = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findByPk(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (!driver.licenseNumber || !driver.licensePhoto) {
      return res.status(400).json({ message: "Cannot verify — license incomplete." });
    }

    driver.isVerified = true;
    driver.licenseVerified = true;
    await driver.save();

    res.status(200).json({ message: "Driver verified successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Driver verification failed." });
  }
};

// driverController.js  – getPendingDrivers
export const getPendingDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: { /* …your filters… */ 
        isVerified: false,
        aadharVerified: true,         // ✅ Aadhaar is verified
        licenseVerified: false,       // ✅ License still pending
        aadharNumber: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        licenseNumber: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        aadharPhoto: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        licensePhoto: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: [
        "driverId",
        "aadharNumber",
        "licenseNumber",
        "aadharPhoto",
        "licensePhoto"
      ],
      include: [
        {
          model: User,
          attributes: ["fullName", "email", "phoneNo"],
        },
      ],
    });

    // prepend the upload path so frontend gets a ready URL
    const host = `${req.protocol}://${req.get("host")}`;
    const formatted = drivers.map((d) => {
      const obj = d.toJSON();

      // Sequelize nests the joined row under the alias (lower-case model name by default)
      const u = obj.User || obj.user || {};   // <- safe grab

      obj.aadharPhotoUrl  = `${host}/uploads/${obj.aadharPhoto}`;
      obj.licensePhotoUrl = `${host}/uploads/${obj.licensePhoto}`;

      obj.fullName = u.fullName || "";
      obj.email    = u.email    || "";
      obj.phoneNo  = u.phoneNo  || "";

      delete obj.User;
      delete obj.user;

      return obj;
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ getPendingDrivers error →", err);  
    res.status(500).json({ message: "Failed to fetch pending drivers." });
  }
};

export const getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const driver = await Driver.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["fullName", "email", "phoneNo"],
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
          ],
        },
      ],
    });

    if (!driver) return res.status(404).json({ message: "Driver profile not found." });

    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch driver profile." });
  }
};

export const rejectDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found." });

   // Delete license photo file (optional)
if (driver?.licensePhoto) {
  const filePath = path.join(process.cwd(), "uploads", driver.licensePhoto);
  fs.unlink(filePath, (err) => {
    if (err) console.error("Failed to delete license photo:", err);
  });
}

// Clear only license info
await driver.update({
  licenseNumber: null,
  licensePhoto: null,
  licenseVerified: false,
});

    res.json({ message: "Driver rejected and data cleared successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject driver." });
  }
};

export const getDriversWithAadhaar = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: {
        aadharNumber: { [Op.ne]: null },
        aadharPhoto: { [Op.ne]: null },
        isVerified: false,
        aadharVerified: false,
      },
      include: [
        {
          model: User,
          attributes: ['fullName', 'email', 'phoneNo'],
          required: false,  // so that drivers without users don't break query
        },
      ],
    });
    console.log('Drivers fetched:', drivers.length);
    res.json(drivers);
  } catch (err) {
    console.error("❌ getDriversWithAadhaar error:", err);
    res.status(500).json({ message: "Failed to fetch drivers." });
  }
};



export const verifyAadhaar = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    driver.aadharVerified = true;    // mark Aadhaar verified
    await driver.save();

    res.json({ message: "Aadhaar verified successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify Aadhaar." });
  }
};

export const rejectAadhaar = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    // Remove Aadhaar info
    driver.aadharNumber = null;
    driver.aadharPhoto = null;
    driver.aadharVerified = false; // reset verification flag
    await driver.save();
    await Driver.destroy({ where: { driverId: driverId } });


    res.json({ message: "Aadhaar rejected and data deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject Aadhaar." });
  }
};