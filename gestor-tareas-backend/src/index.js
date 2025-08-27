// src/index.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import { testConnection } from "./config/db.js";

// --- Importar Rutas ---
import userRoutes from "./routes/usuarios.routes.js";
import taskRoutes from "./routes/tareas.routes.js";
import deptoRoutes from "./routes/departamentos.routes.js";
import solicitudRoutes from "./routes/solicitudes.routes.js";
import comentarioRoutes from "./routes/comentarios.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import compromisoRoutes from "./routes/compromisos.routes.js";
import agendaRoutes from "./routes/agenda.routes.js";

// Crear la app de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Probar la conexión a la DB al iniciar
testConnection();

// Middleware para entender JSON
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡El servidor del gestor de tareas está funcionando! 🚀");
});

// --- Usar Rutas ---
app.use("/api/usuarios", userRoutes);
app.use("/api/tareas", taskRoutes);
app.use("/api/departamentos", deptoRoutes);
app.use("/api/solicitudes", solicitudRoutes);
app.use("/api", comentarioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/compromisos", compromisoRoutes);
app.use("/api/agenda", agendaRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
