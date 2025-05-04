import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import Driver from "../driver/driver.js";

const Ride = sequelize.define("ride", {
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
}, {
  timestamps: true,
  freezeTableName: true,
});

Ride.belongsTo(Driver, {
  foreignKey: "driverId",
  onDelete: "CASCADE",
});

Driver.hasMany(Ride, {
  foreignKey: "driverId",
});

export default Ride;
