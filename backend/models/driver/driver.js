import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "../user/user.js";

const driver = sequelize.define("driver", {
  driverId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Ensures one user cannot register as driver multiple times
  }
}, {
  timestamps: true,
  freezeTableName: true,
});

driver.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

User.hasOne(driver, {
  foreignKey: "userId",
});

export default driver;
