import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import Driver from "../driver/driver.js";
import Vehicle from "../driver/vehicle.js";

const DriverRide = sequelize.define("driverRide", {
  driverRideId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   vehicleId: {    // <-- add this new field
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehicle',
      key: 'vehicleId',
    },
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
  status: {
      type: DataTypes.STRING,
      allowNull: false,
  }
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

DriverRide.belongsTo(Vehicle, {
  foreignKey: "vehicleId",
  onDelete: "CASCADE",
});
Vehicle.hasMany(DriverRide, {
  foreignKey: "vehicleId",
});

export default DriverRide;
