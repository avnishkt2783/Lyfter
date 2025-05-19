import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
// import User from "../user/user.js";

// const driver = sequelize.define("driver", {
const Driver = sequelize.define("driver", {
  driverId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  //   unique: true, // Ensures one user cannot register as driver multiple times
  // }
  },
  aadharNumber: DataTypes.STRING,
  aadharPhoto: DataTypes.STRING,
  licenseNumber: DataTypes.STRING,
  licensePhoto: DataTypes.STRING,
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
  }  
}, {
  timestamps: true,
  freezeTableName: true,
});

// driver.belongsTo(User, {
//   foreignKey: "userId",
//   onDelete: "CASCADE",
// });

// User.hasOne(driver, {
//   foreignKey: "userId",
// });

// export default driver;

export default Driver;