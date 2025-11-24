// import pg from "pg";
// import dotenv from "dotenv";
// dotenv.config();

// const pool = new pg.Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: Number(process.env.DB_PORT || 5432),
// });

// pool.on("connect", () => console.log("Connected to PostgreSQL"));

// export default pool;
// src/backend/config/db.js

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

console.log("📦 db.js loaded");   // <– add this line

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../../database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite DB:", err);
  } else {
    console.log("✅ Connected to SQLite database at:", dbPath);
  }
});

export default db;
