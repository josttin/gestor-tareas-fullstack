// src/routes/comentarios.routes.js
import { Router } from "express";
import {
  getComentariosPorTarea,
  createComentario,
} from "../controllers/comentarios.controller.js";
import { protegerRuta } from "../middleware/auth.middleware.js";

const router = Router();

// Ambas rutas solo requieren que el usuario esté logueado
router.get(
  "/tareas/:tareaId/comentarios",
  protegerRuta,
  getComentariosPorTarea
);
router.post("/tareas/:tareaId/comentarios", protegerRuta, createComentario);

export default router;
