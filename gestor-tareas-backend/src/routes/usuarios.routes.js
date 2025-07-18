// src/routes/usuarios.routes.js
import { Router } from "express";
// Importa todas las funciones del controlador, incluyendo la nueva
import {
  registrarUsuario,
  loginUsuario,
  verPerfil,
  obtenerEmpleados,
  asignarDepartamento,
} from "../controllers/usuarios.controller.js";
// Importa los middlewares sin duplicados
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// --- Rutas Públicas ---
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);

// --- Rutas Protegidas ---
router.get("/perfil", protegerRuta, verPerfil);
router.get("/empleados", protegerRuta, autorizarJefe, obtenerEmpleados);

// Ruta para que un jefe asigne un departamento a un empleado
router.put(
  "/:usuarioId/departamento",
  protegerRuta,
  autorizarJefe,
  asignarDepartamento
);

export default router;
