import Driver from "../models/driver/driver.js";
import User from "../models/user/user.js";
import Vehicle from "../models/driver/vehicle.js";
import { Op } from "sequelize";
import fs from 'fs';
import path from 'path';
import { cloudinary } from "../middleware/upload.js";
// import cloudinary from "../config/cloudinary.js";

// export const requestDriver = async (req, res) => {
//   try {
//     console.log("DEBUG user", req.user);      // <— add
//     const userId = req?.user?.id;             // safe-chain
//     if (!userId) {
//       return res.status(401).json({ message: "Unauthenticated" });
//     }
//     const { aadharNumber } = req.body;

//     const aadharPhoto = req.file?.filename;
//     if (!aadharNumber || !aadharPhoto) {
//       return res.status(400).json({ message: "Aadhar details required." });
//     }

//     const existing = await Driver.findOne({ where: { userId } });
//     if (existing) return res.status(400).json({ message: "Already requested." });

//     await Driver.create({ userId, aadharNumber, aadharPhoto });
//     res.status(201).json({ message: "Driver request submitted." });
//   } catch (err) {
//     console.error("❌ Driver request failed:", err);
//     res.status(500).json({ message: "Driver request failed." });
//   }
// };

// export const requestDriver = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { aadharNumber } = req.body;

//     const user = await Driver.findOne({ where: { userId } });

//     if (!req.file) {
//       return res.status(400).json({ message: "Aadhaar photo is required" });
//     }

//     const aadharImgUrl = req.file.path;
//     const aadharImgPublicId = req.file.filename;

//     if (user.aadharImgPublicId) {
//         await cloudinary.uploader.destroy(user.aadharImgPublicId);
//       }

//     // Upsert logic: if already exists, update; else create
//     const [driver, created] = await Driver.findOrCreate({
//       where: { userId },
//       defaults: {
//         aadharNumber,
//         aadharImg: aadharImgUrl,
//         aadharImgPublicId,
//         status: "Pending Aadhaar",
//       },
//     });

//     if (!created) {
//       if (driver.aadharImgPublicId) {
//         await cloudinary.uploader.destroy(driver.aadharImgPublicId);
//       }
//       // Update if already exists
//       driver.aadharNumber = aadharNumber;
//       driver.aadharImg = aadharImgUrl;
//       driver.aadharImgPublicId = aadharImgPublicId;
//       driver.status = "Pending Aadhaar";
//       await driver.save();
//     }

//     res.status(200).json({ message: "Driver Aadhaar submitted", driver });
//   } catch (err) {
//     console.error("Error submitting Aadhaar:", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

export const requestDriver = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("req.user:", req.user);
if (!req.user) return res.status(401).json({ message: "Unauthorized" });


console.log("req.file:", req.file);

    const { aadharNumber } = req.body;

    console.log('""""""""""""""""""""""');
    console.log(userId);    

    if (!req.file) {
      return res.status(400).json({ message: "Aadhaar photo is required" });
    }

    const aadharImg = req.file.path;
    const aadharImgPublicId = req.file.filename;

    console.log("aadharImg", aadharImg);
    console.log("aadharImgPublicId", aadharImgPublicId);
    

    let driver = await Driver.findOne({ where: { userId } });

    if (driver) {
      // Delete old image if exists
      if (driver.aadharImgPublicId) {
        await cloudinary.uploader.destroy(driver.aadharImgPublicId);
      }

      // Update
      driver.aadharNumber = aadharNumber;
      driver.aadharImg = aadharImg;
      driver.aadharImgPublicId = aadharImgPublicId;
      // driver.status = "Pending Aadhaar";
      driver.aadharVerified = false;
      await driver.save();
    } else {
      // Create new
      driver = await Driver.create({
        userId,
        aadharNumber,
        aadharImg,
        aadharImgPublicId,
        // status: "Pending Aadhaar",
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



// export const submitLicense = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { licenseNumber } = req.body;
//     const licensePhoto = req.file?.filename;

//     const user = await Driver.findOne({ where: { userId } });
//     if (!user) return res.status(404).json({ message: "Not a driver yet." });

//     user.licenseNumber = licenseNumber;
//     user.licensePhoto = licensePhoto;

//     if (user.licensePhotoPublicId) {
//         await cloudinary.uploader.destroy(user.licensePhotoPublicId);
//       }

//       const [driver, created] = await Driver.findOrCreate({
//       where: { userId },
//       defaults: {
//         licenseNumber,
//         licensePhoto,
//         licensePhotoPublicId: user.licensePhotoPublicId,
//       },
//     });


//     await driver.save();
//     res.status(200).json({ message: "License submitted. Awaiting admin verification." });
//   } catch (err) {
//     res.status(500).json({ message: "License upload failed." });
//   }
// };

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

    res
      .status(200)
      .json({ message: "License submitted. Awaiting admin verification.", driver });
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
// export const getPendingDrivers = async (req, res) => {
//   try {
//     const drivers = await Driver.findAll({
//       where: { /* …your filters… */ 
//         isVerified: false,
//         aadharVerified: true,         // ✅ Aadhaar is verified
//         licenseVerified: false,       // ✅ License still pending
//         aadharNumber: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
//         licenseNumber: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
//         aadharPhoto: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
//         licensePhoto: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
//       },
//       attributes: [
//         "driverId",
//         "aadharNumber",
//         "licenseNumber",
//         "aadharPhoto",
//         "licensePhoto"
//       ],
//       include: [
//         {
//           model: User,
//           attributes: ["fullName", "email", "phoneNo"],
//         },
//       ],
//     });

//     // prepend the upload path so frontend gets a ready URL
//     const host = `${req.protocol}://${req.get("host")}`;
//     const formatted = drivers.map((d) => {
//       const obj = d.toJSON();

//       // Sequelize nests the joined row under the alias (lower-case model name by default)
//       const u = obj.User || obj.user || {};   // <- safe grab

//       obj.aadharPhotoUrl  = `${host}/uploads/${obj.aadharPhoto}`;
//       obj.licensePhotoUrl = `${host}/uploads/${obj.licensePhoto}`;

//       obj.fullName = u.fullName || "";
//       obj.email    = u.email    || "";
//       obj.phoneNo  = u.phoneNo  || "";

//       delete obj.User;
//       delete obj.user;

//       return obj;
//     });

//     res.json(formatted);
//   } catch (err) {
//     console.error("❌ getPendingDrivers error →", err);  
//     res.status(500).json({ message: "Failed to fetch pending drivers." });
//   }
// };

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
        "aadharImg",         // ✅ Cloudinary Aadhar image URL
        "licensePhoto",      // ✅ Cloudinary License image URL
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
        aadharImg: obj.aadharImg,                 // cloudinary URL
        licensePhoto: obj.licensePhoto,           // cloudinary URL
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

    if (!driver) return res.status(404).json({ message: "Driver profile not found." });

    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch driver profile." });
  }
};

// export const rejectDriver = async (req, res) => {
//   try {
//     const { driverId } = req.params;
//     const driver = await Driver.findOne({ where: { driverId } });
//     if (!driver) return res.status(404).json({ message: "Driver not found." });

//    // Delete license photo file (optional)
// if (driver?.licensePhoto) {
//   const filePath = path.join(process.cwd(), "uploads", driver.licensePhoto);
//   fs.unlink(filePath, (err) => {
//     if (err) console.error("Failed to delete license photo:", err);
//   });
// }

// // Clear only license info
// await driver.update({
//   licenseNumber: null,
//   licensePhoto: null,
//   licenseVerified: false,
// });

//     res.json({ message: "Driver rejected and data cleared successfully." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to reject driver." });
//   }
// };

// export const getDriversWithAadhaar = async (req, res) => {
//   try {
//     const drivers = await Driver.findAll({
//       where: {
//         aadharNumber: { [Op.ne]: null },
//         aadharPhoto: { [Op.ne]: null },
//         isVerified: false,
//         aadharVerified: false,
//       },
//       include: [
//         {
//           model: User,
//           attributes: ['fullName', 'email', 'phoneNo'],
//           required: false,  // so that drivers without users don't break query
//         },
//       ],
//     });
//     console.log('Drivers fetched:', drivers.length);
//     res.json(drivers);
//   } catch (err) {
//     console.error("❌ getDriversWithAadhaar error:", err);
//     res.status(500).json({ message: "Failed to fetch drivers." });
//   }
// };

// import cloudinary from "cloudinary";
// import path from "path";
// import fs from "fs/promises";

export const rejectDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    // Delete license photo from Cloudinary
    if (driver.licensePhoto) {
      // Extract Cloudinary public_id from URL or store it directly during upload
      const publicId = driver.licensePhotoPublicId; 
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary deletion failed:", err);
        }
      }
    }

    // Clear license fields in DB
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
          attributes: ['fullName', 'email', 'phoneNo'],
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


// export const verifyAadhaar = async (req, res) => {
//   try {
//     const { driverId } = req.params;
//     const driver = await Driver.findOne({ where: { driverId } });
//     if (!driver) return res.status(404).json({ message: "Driver not found." });

//     driver.aadharVerified = true;    // mark Aadhaar verified
//     await driver.save();

//     res.json({ message: "Aadhaar verified successfully." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to verify Aadhaar." });
//   }
// };

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


// export const rejectAadhaar = async (req, res) => {


//   try {
//     const { driverId } = req.params;
//     const driver = await Driver.findOne({ where: { driverId } });
//     if (!driver) return res.status(404).json({ message: "Driver not found." });

//     // Remove Aadhaar info
//     driver.aadharNumber = null;
//     driver.aadharPhoto = null;
//     driver.aadharVerified = false; // reset verification flag
//     await driver.save();
//     await Driver.destroy({ where: { driverId: driverId } });


//     res.json({ message: "Aadhaar rejected and data deleted." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to reject Aadhaar." });
//   }
// };

// import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const rejectAadhaar = async (req, res) => {
//   try {
//     const { driverId } = req.params;
//     const driver = await Driver.findOne({ where: { driverId } });
//     if (!driver) return res.status(404).json({ message: "Driver not found." });

//     // Delete from Cloudinary
//     if (driver.aadharImgPublicId) {
//       await cloudinary.uploader.destroy(driver.aadharImgPublicId);
//     }

//     // Remove Aadhaar info
//     driver.aadharNumber = null;
//     driver.aadharImg = null;
//     driver.aadharImgPublicId = null;
//     driver.aadharVerified = false;
//     await driver.save();

//     res.json({ message: "Aadhaar rejected and data deleted." });
//   } catch (err) {
//     console.error("❌ rejectAadhaar error:", err);
//     res.status(500).json({ message: "Failed to reject Aadhaar." });
//   }
// };

export const rejectAadhaar = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ where: { driverId } });
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    // Delete Aadhaar image from Cloudinary
    if (driver.aadharImgPublicId) {
      await cloudinary.uploader.destroy(driver.aadharImgPublicId);
    }

    // Delete driver entry from DB
    await driver.destroy();

    res.json({ message: "Driver rejected and deleted from the system." });
  } catch (err) {
    console.error("❌ rejectAadhaar error:", err);
    res.status(500).json({ message: "Failed to reject and delete driver." });
  }
};
