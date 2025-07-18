// src/routes/tareas.routes.js
import { Router } from "express";
import {
  crearTarea,
  verMisTareas,
  actualizarEstadoTarea,
  eliminarTarea,
  verTodasLasTareas,
  getTareaById,
  getTareasPorDepartamento,
} from "../controllers/tareas.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// --- Rutas más específicas primero ---

// Obtener todas las tareas (para el jefe)
router.get("/", protegerRuta, autorizarJefe, verTodasLasTareas);

// Obtener las tareas asignadas a un empleado
router.get("/mis-tareas", protegerRuta, verMisTareas);

// Obtener las tareas del departamento de un empleado
router.get("/departamento", protegerRuta, getTareasPorDepartamento);

// --- Rutas dinámicas (con :id) después ---

// Obtener una tarea específica por ID
router.get("/:id", protegerRuta, getTareaById);

// Crear una nueva tarea
router.post("/", protegerRuta, autorizarJefe, crearTarea);

// Actualizar una tarea
router.put("/:id", protegerRuta, actualizarEstadoTarea);

// Eliminar una tarea
router.delete("/:id", protegerRuta, autorizarJefe, eliminarTarea);

export default router;
