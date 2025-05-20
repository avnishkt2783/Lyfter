// models/driver/vehicle.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import driver from "./driver.js";

const Vehicle = sequelize.define(
  "vehicle",
  {
    vehicleId:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    driverId:     { type: DataTypes.INTEGER, allowNull: false },
    brand:        {type: DataTypes.STRING, allowNull: false},
    model:        {type: DataTypes.STRING, allowNull: false},
    color:        {type:DataTypes.STRING, allowNull: false},
    plateNumber:  {type:DataTypes.STRING, allowNull: false, unique: true,},
    vehiclePhoto: {type:DataTypes.STRING, allowNull: false},
    vehiclePhotoPublicId: {type:DataTypes.STRING, allowNull: false},
  },
  { timestamps: true, freezeTableName: true }
);

driver.hasMany(Vehicle, { foreignKey: "driverId" });
Vehicle.belongsTo(driver, { foreignKey: "driverId" });

export default Vehicle;