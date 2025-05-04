import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "../user/user.js";

const passenger = sequelize.define("passenger", {
  passengerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Ensures one user cannot register as passenger multiple times
  }
}, {
  timestamps: true,
  freezeTableName: true,
});

passenger.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasOne(passenger, {
  foreignKey: "userId",
});

export default passenger;
