// db.js
import { Pool } from "pg"; // импортируем класс Pool из pg модуля

// Создаем пул подключений
const pool = new Pool({
  user: "postgres",          // твой логин
  host: "localhost",         // если база на этой же машине
  database: "postgres",        // имя базы
  password: "2007", // пароль от PostgreSQL
  port: 5432,
  connectionString: process.env.DATABASE_URL,                // стандартный порт PostgreSQL
});

// аккуратное завершение
process.on("SIGINT", async () => { await pool.end(); process.exit(0); });
process.on("SIGTERM", async () => { await pool.end(); process.exit(0); });

export default pool;