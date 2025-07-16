// src/config/db.js
import mysql from "mysql2/promise";
import pg from "pg";
import "dotenv/config";

// Usamos el Pool de 'pg' para producción (Render) y el de 'mysql2' para desarrollo
let pool;

if (process.env.NODE_ENV === "production") {
  // Configuración para PostgreSQL en Render
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Configuración para MySQL en local
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
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
