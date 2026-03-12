import fs from "fs";
import path from "path";
import pool from "../lib/db";

async function run() {
  const sqlPath = path.join(process.cwd(), "DataBase", "book_store.sql");
  const content = fs.readFileSync(sqlPath, "utf8");

  // split on semicolon mostly
  const statements = content
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      console.error("Error executing statement", stmt, err);
    }
  }

  console.log("Database initialization complete.");
  process.exit(0);
}

run();
