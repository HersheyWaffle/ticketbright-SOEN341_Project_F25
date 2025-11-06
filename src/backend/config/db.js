//import pg from "pg";
//import dotenv from "dotenv";

//dotenv.config();

//const pool = new pg.Pool({
//  user: process.env.DB_USER,
//  host: process.env.DB_HOST,
//  database: process.env.DB_NAME,
//  password: process.env.DB_PASS,
//  port: process.env.DB_PORT,
//});

//pool.on("connect", () => console.log("Connected to PostgreSQL"));

//export default pool;

import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite", // creates a file in project root
  logging: false,
});

export default sequelize;