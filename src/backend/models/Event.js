import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Event = sequelize.define("Event", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: DataTypes.STRING,
  description: { type: DataTypes.TEXT, allowNull: false },
  speakers: DataTypes.TEXT,
  categories: DataTypes.JSON,   // array of strings
  tags: DataTypes.JSON,         // array of strings
  organizerName: { type: DataTypes.STRING, allowNull: false },
  organizerEmail: { type: DataTypes.STRING, allowNull: false },
  organizerType: DataTypes.STRING,
  date: DataTypes.DATEONLY,
  time: DataTypes.TIME,
  durationMinutes: DataTypes.INTEGER,
  mode: DataTypes.STRING,
  eventLink: DataTypes.STRING,
  location: DataTypes.STRING,
  accessibility: DataTypes.TEXT,
  capacity: DataTypes.INTEGER,
  ticketType: DataTypes.STRING,
  price: DataTypes.FLOAT,
  registrationDeadline: DataTypes.DATE,
  bannerPath: DataTypes.STRING,
  ticketsSold: { type: DataTypes.INTEGER, defaultValue: 0 },
  attendances: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: "draft" },
  eventID: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
});

export default Event;