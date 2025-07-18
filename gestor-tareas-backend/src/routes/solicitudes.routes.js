// src/routes/solicitudes.routes.js
import { Router } from "express";
import {
  createSolicitud,
  getMisSolicitudes,
  getAllSolicitudes,
  updateSolicitudStatus,
} from "../controllers/solicitudes.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas para Empleados (solo necesitan estar logueados)
router.post("/", protegerRuta, createSolicitud);
router.get("/mis-solicitudes", protegerRuta, getMisSolicitudes);

// Rutas para Jefes (necesitan estar logueados Y ser jefes)
router.get("/", protegerRuta, autorizarJefe, getAllSolicitudes);
router.put("/:id", protegerRuta, autorizarJefe, updateSolicitudStatus);

export default router;
