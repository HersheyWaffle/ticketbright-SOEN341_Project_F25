import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite", // creates a file in project root
  logging: false,
});

export default sequelize;