import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "../user/user.js";

const Driver = sequelize.define(
  "driver",
  {
    driverId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

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

    licenseNumber: {
      type: DataTypes.STRING,
    },
    licensePhoto: {
      type: DataTypes.STRING,
    },
    licensePhotoPublicId: {
      type: DataTypes.STRING,
    },

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
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);

Driver.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Driver, { foreignKey: "userId" });

export default Driver;
