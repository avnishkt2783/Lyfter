import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import passenger from "../passenger/passenger.js";

const PassengerRide = sequelize.define("passengerRide", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  passengerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
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
  seatsRequired: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rideId: {
    type: DataTypes.INTEGER,
    allowNull: true, // filled on confirm
  },
}, {
  timestamps: true,
  freezeTableName: true,
});

PassengerRide.belongsTo(passenger, { foreignKey: "passengerId" });

export default PassengerRide;
