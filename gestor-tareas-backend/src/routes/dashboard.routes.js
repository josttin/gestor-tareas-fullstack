// src/routes/dashboard.routes.js
import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// Esta ruta solo será accesible para un jefe logueado
router.get("/stats", protegerRuta, autorizarJefe, getDashboardStats);

export default router;
