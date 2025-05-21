import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "../user/user.js";

const Driver = sequelize.define("driver", {
  driverId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Prevent multiple driver entries for one user
  },

  // Aadhaar fields
  aadharNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aadharImg: {
  type: DataTypes.STRING,
  allowNull: false,
  },
  aadharImgPublicId: {
    type: DataTypes.STRING,
    allowNull: false,
  },


  // License fields (used in later step)
  licenseNumber: {
    type: DataTypes.STRING,
  },
  licensePhoto: {
    type: DataTypes.STRING, // Cloudinary URL
  },
  licensePhotoPublicId: {
    type: DataTypes.STRING, // Cloudinary public_id for deletion
  },

  // Verification status
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  aadharVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  licenseVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
  freezeTableName: true,
});

Driver.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Driver, { foreignKey: 'userId' });

export default Driver;
