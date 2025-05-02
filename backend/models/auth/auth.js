import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

import User from "../user/user.js";

const auth = sequelize.define("auth", {
  authId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
    token: {
    type: DataTypes.TEXT
  }
}, 
{
  timestamps: true,
  tableName: 'auth'
});

auth.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(auth, {
  foreignKey: 'userId'
});

export default auth;
 