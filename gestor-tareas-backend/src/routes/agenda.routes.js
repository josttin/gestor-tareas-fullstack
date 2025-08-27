// src/routes/agenda.routes.js
import { Router } from "express";
import { getEventosDelMes } from "../controllers/agenda.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// Esta ruta solo será accesible para un jefe logueado
router.get("/eventos", protegerRuta, autorizarJefe, getEventosDelMes);

export default router;
