
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import passengerRide from "../ride/passengerRide.js";
import driverRide from "../ride/driverRide.js";

const PassengerRideDriverRide = sequelize.define("passengerRideDriverRide", {
    passengerRideDriverRideId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    passengerRideId: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },  
    driverRideId: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
  timestamps: true,
  freezeTableName: true,
});

PassengerRideDriverRide.belongsTo(passengerRide, { 
    foreignKey: "passengerRideId", 
    onDelete: 'CASCADE' 
});

passengerRide.hasMany(PassengerRideDriverRide, {
    foreignKey: "passengerRideId"
});

PassengerRideDriverRide.belongsTo(driverRide, { 
    foreignKey: "driverRideId", 
    onDelete: 'CASCADE' 
});

driverRide.hasMany(PassengerRideDriverRide, {
    foreignKey: "driverRideId"
});

export default PassengerRideDriverRide;