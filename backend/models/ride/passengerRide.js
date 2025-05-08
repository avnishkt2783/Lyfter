
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import passenger from "../passenger/passenger.js";

const PassengerRide = sequelize.define("passengerRide", {
  passengerRideId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  passengerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  passengerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passengerPhoneNo: {
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
  driverRideId: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
}, {
  timestamps: true,
  freezeTableName: true,
});

PassengerRide.belongsTo(passenger, { 
  foreignKey: "passengerId",
  onDelete: 'CASCADE' 
});

passenger.hasMany(PassengerRide, {
  foreignKey: "passengerId",
})

export default PassengerRide;