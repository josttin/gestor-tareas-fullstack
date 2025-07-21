// src/routes/comentarios.routes.js
import { Router } from "express";
import {
  getComentariosPorTarea,
  createComentario,
} from "../controllers/comentarios.controller.js";
import { protegerRuta } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js"; // <-- Importa Multer

const router = Router();

router.get(
  "/tareas/:tareaId/comentarios",
  protegerRuta,
  getComentariosPorTarea
);
// Añadimos el middleware de subida de archivos aquí
router.post(
  "/tareas/:tareaId/comentarios",
  protegerRuta,
  upload.single("archivo"),
  createComentario
);

export default router;
