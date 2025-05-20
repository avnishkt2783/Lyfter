import Driver from "../models/driver/driver.js";
import User from "../models/user/user.js";
import { Op } from 'sequelize';

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
        attributes: ['userId', 'fullName', 'email', 'phoneNo'],
      },
    });

    res.status(200).json({ drivers: pendingDrivers });
  } catch (err) {
    console.error("Error fetching pending driver requests:", err);
    res.status(500).json({ message: "Failed to fetch pending driver requests" });
  }
};
