import Driver from "../models/driver/driver.js";
import User from "../models/user/user.js";
import Vehicle from "../models/driver/vehicle.js";
import { Op } from "sequelize";
import { cloudinary } from "../middleware/upload.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const requestDriver = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { aadharNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Aadhaar photo is required" });
    }

    const aadharImg = req.file.path;
    const aadharImgPublicId = req.file.filename;

    let driver = await Driver.findOne({ where: { userId } });

    if (driver) {
      if (driver.aadharImgPublicId) {
        await cloudinary.uploader.destroy(driver.aadharImgPublicId);
      }

      driver.aadharNumber = aadharNumber;
      driver.aadharImg = aadharImg;
      driver.aadharImgPublicId = aadharImgPublicId;
      driver.aadharVerified = false;
      await driver.save();
    } else {
      driver = await Driver.create({
        userId,
        aadharNumber,
        aadharImg,
        aadharImgPublicId,
        aadharVerified: false,
        isVerified: false,
      });
    }

    res.status(200).json({ message: "Driver Aadhaar submitted", driver });
  } catch (err) {
    console.error("Error submitting Aadhaar:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const submitLicense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { licenseNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "License photo is required." });
    }

    const licensePhoto = req.file.path;
    const licensePhotoPublicId = req.file.filename;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({ message: "Not a driver yet." });
    }

    if (driver.licensePhotoPublicId) {
      await cloudinary.uploader.destroy(driver.licensePhotoPublicId);
    }

    driver.licenseNumber = licenseNumber;
    driver.licensePhoto = licensePhoto;
    driver.licensePhotoPublicId = licensePhotoPublicId;
    driver.licenseVerified = false;
    driver.status = "Pending License";
    await driver.save();

    res.status(200).json({
      message: "License submitted. Awaiting admin verification.",
      driver,
    });
  } catch (err) {
    console.error("License submission error:", err);
    res.status(500).json({ message: "License upload failed." });
  }
};

export const checkDriverStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) {
      return res.status(404).json({ message: "Not a driver." });
    }

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
      return res
        .status(400)
        .json({ message: "Cannot verify — license incomplete." });
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

export const getPendingDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      where: {
        isVerified: false,
        aadharVerified: true,
        licenseVerified: false,
        aadharNumber: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        licenseNumber: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        aadharImg: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
        licensePhoto: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
      },
      attributes: [
        "driverId",
        "aadharNumber",
        "licenseNumber",
        "aadharImg",
        "licensePhoto",
      ],
      include: [
        {
          model: User,
          attributes: ["fullName", "email", "phoneNo"],
        },
      ],
    });

    const formatted = drivers.map((d) => {
      const obj = d.toJSON();
      const u = obj.User || obj.user || {};

      return {
        driverId: obj.driverId,
        aadharNumber: obj.aadharNumber,
        licenseNumber: obj.licenseNumber,
        aadharImg: obj.aadharImg,
        licensePhoto: obj.licensePhoto,
        fullName: u.fullName || "",
        email: u.email || "",
        phoneNo: u.phoneNo || "",
      };
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

    if (!driver)
      return res.status(404).json({ message: "Driver profile not found." });

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
    if (driver.licensePhoto) {
      const publicId = driver.licensePhotoPublicId;
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary deletion failed:", err);
        }
      }
    }

    await driver.update({
      licenseNumber: null,
      licensePhoto: null,
      licenseVerified: false,
      licensePhotoPublicId: null,
      isVerified: false,
    });

    res.json({ message: "Driver rejected and license data cleared." });
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
        aadharImg: { [Op.ne]: null },
        isVerified: false,
        aadharVerified: false,
      },
      include: [
        {
          model: User,
          attributes: ["fullName", "email", "phoneNo"],
          required: false,
        },
      ],
    });
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

    driver.aadharVerified = true;
    await driver.save();

    res.json({ message: "Aadhaar verified successfully." });
  } catch (err) {
    console.error("❌ verifyAadhaar error:", err);
    res.status(500).json({ message: "Failed to verify Aadhaar." });
  }
};

export const rejectAadhaar = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    if (driver.aadharImgPublicId) {
      await cloudinary.uploader.destroy(driver.aadharImgPublicId);
    }

    await driver.destroy();

    res.json({ message: "Driver rejected and deleted from the system." });
  } catch (err) {
    console.error("❌ rejectAadhaar error:", err);
    res.status(500).json({ message: "Failed to reject and delete driver." });
  }
};
