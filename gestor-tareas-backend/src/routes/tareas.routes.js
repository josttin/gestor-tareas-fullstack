// src/routes/tareas.routes.js
import { Router } from "express";
import {
  crearTarea,
  verMisTareas,
  actualizarEstadoTarea,
  eliminarTarea,
  verTodasLasTareas,
  getTareaById,
} from "../controllers/tareas.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protegerRuta, autorizarJefe, verTodasLasTareas);

router.post("/", protegerRuta, autorizarJefe, crearTarea);

router.get("/mis-tareas", protegerRuta, verMisTareas);

router.put("/:id", protegerRuta, actualizarEstadoTarea);

router.delete("/:id", protegerRuta, autorizarJefe, eliminarTarea);

router.get("/:id", protegerRuta, getTareaById);

export default router;
