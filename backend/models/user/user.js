import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const User = sequelize.define("user", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phoneNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  address: {
    type: DataTypes.JSON, 
    allowNull: true,
  },
  profileImg: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isLoggedIn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: true,  
    defaultValue: "dark",
  },
}, {
  freezeTableName: true,
});

export default User;
