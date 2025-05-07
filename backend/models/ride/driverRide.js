import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import Driver from "../driver/driver.js";

const DriverRide = sequelize.define("driverRide", {
  rideId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fare: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  routePath: {
    type: DataTypes.TEXT,
    allowNull: false
  },
}, {
  timestamps: true,
  freezeTableName: true,
});

DriverRide.belongsTo(Driver, {
  foreignKey: "driverId",
  onDelete: "CASCADE",
});

Driver.hasMany(DriverRide, {
  foreignKey: "driverId",
});

export default DriverRide;
