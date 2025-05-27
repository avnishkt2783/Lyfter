import User from "../models/user/user.js";
import Driver from "../models/driver/driver.js";
import { Op } from "sequelize";

export const getPendingDriverRequests = async (req, res) => {
  try {
    const pendingDrivers = await Driver.findAll({
      where: {
        [Op.or]: [
          { isVerified: false },
          { aadharVerified: false },
          { licenseVerified: false },
        ],
      },
      include: {
        model: User,
        attributes: ["userId", "fullName", "email", "phoneNo"],
      },
    });

    res.status(200).json({ drivers: pendingDrivers });
  } catch (err) {
    console.error("Error fetching pending driver requests:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch pending driver requests" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["userId", "fullName", "email", "role", "phoneNo"],
    });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log("💦💦💦💦USER ID: ", userId);

    await User.update({ role: "admin" }, { where: { userId } });
    res.status(200).json({ message: "User promoted to admin." });
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(500).json({ message: "Failed to promote user." });
  }
};

// export const demoteAdmin = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     // Fetch the user first
//     const user = await User.findOne({ where: { userId } });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Check if it's the SUPER USER
//     if (
//       user.email === "superuser@lyfter.com" ||
//       user.phoneNo === "0000000000"
//     ) {
//       return res
//         .status(403)
//         .json({ message: "SUPER USER can't be demoted from admin role." });
//     }

//     // Proceed to update role
//     await User.update({ role: "user" }, { where: { userId } });
//     res.status(200).json({ message: "Admin rights revoked." });
//   } catch (err) {
//     console.error("Error revoking admin:", err);
//     res.status(500).json({ message: "Failed to revoke admin." });
//   }
// };

export const demoteAdmin = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const requesterUserId = req.user?.userId;

    console.log("⚡target (string): ", String(targetUserId));
    console.log("🐤requester (string): ", String(requesterUserId));
    console.log(
      "⚠️ Equality test:",
      String(targetUserId) === String(requesterUserId)
    );

    if (String(targetUserId) === String(requesterUserId)) {
      console.log("🌐 INSIDE IF BLOCK.");
      return res
        .status(403)
        .json({ message: "You cannot demote yourself from admin role." });
    }

    // Fetch the user to be demoted
    const user = await User.findOne({ where: { userId: targetUserId } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent demotion of SUPER USER
    if (
      user.email === "superuser@lyfter.com" ||
      user.phoneNo === "0000000000"
    ) {
      return res
        .status(403)
        .json({ message: "SUPER USER can't be demoted from admin role." });
    }

    // Proceed to demote
    await User.update({ role: "user" }, { where: { userId: targetUserId } });
    res.status(200).json({ message: "Admin rights revoked." });
  } catch (err) {
    console.error("Error revoking admin:", err);
    res.status(500).json({ message: "Failed to revoke admin." });
  }
};
