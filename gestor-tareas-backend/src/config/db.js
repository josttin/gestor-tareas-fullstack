// src/config/db.js
import pg from "pg"; // Solo necesitamos 'pg' ahora
import "dotenv/config";

let pool;

if (process.env.NODE_ENV === "production") {
  // Configuración para Render (no cambia)
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Configuración para LOCAL (ahora apunta a nuestro Docker)
  pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });
}

export const testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Conexión a la base de datos exitosa.");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  }
};

export default pool;
