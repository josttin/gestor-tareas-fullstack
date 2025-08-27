// src/routes/compromisos.routes.js
import { Router } from "express";
import {
  createCompromiso,
  deleteCompromiso,
} from "../controllers/compromisos.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// Todas estas rutas requieren ser un jefe
router.use(protegerRuta, autorizarJefe);

router.post("/", createCompromiso);
router.delete("/:id", deleteCompromiso);

export default router;
