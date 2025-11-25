import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM("student", "organizer", "admin"),
    allowNull: false,
    defaultValue: "student"
  },
  organizationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organizationType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  approved: {
    type: DataTypes.INTEGER, // -1 = rejected, 0 = pending, 1 = approved
    defaultValue: 1 // default for students
  }
});

export default User;