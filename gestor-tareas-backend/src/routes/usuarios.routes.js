// src/routes/usuarios.routes.js
import { Router } from "express";
// Importa las 3 funciones del controlador
import {
  registrarUsuario,
  loginUsuario,
  verPerfil,
  obtenerEmpleados,
} from "../controllers/usuarios.controller.js";
// Importa el middleware
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// --- Rutas Públicas ---
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

// --- Rutas Protegidas ---
// Para acceder a esta ruta, se debe proporcionar un token válido.
// El middleware 'protegerRuta' se ejecuta primero.
router.get("/perfil", protegerRuta, verPerfil);
router.get("/empleados", protegerRuta, autorizarJefe, obtenerEmpleados);

export default router;
