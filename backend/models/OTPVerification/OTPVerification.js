import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "../user/user.js";

const OTPVerification = sequelize.define(
  "OTPVerification",
  {
    otpId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "otp_verifications",
    timestamps: true,
  }
);

OTPVerification.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasMany(OTPVerification, {
  foreignKey: "userId",
});

export default OTPVerification;
