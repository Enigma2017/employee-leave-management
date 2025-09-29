// db.js
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,   // должно быть employee-leave-db
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

process.on("SIGINT", async () => { await pool.end(); process.exit(0); });
process.on("SIGTERM", async () => { await pool.end(); process.exit(0); });

export default pool;