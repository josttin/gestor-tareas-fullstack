// src/routes/departamentos.routes.js
import { Router } from "express";
import {
  getDepartamentos,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
  asignarLider,
} from "../controllers/departamentos.controller.js";
import { protegerRuta, autorizarJefe } from "../middleware/auth.middleware.js";

const router = Router();

// Todas las rutas de departamentos requieren ser un jefe logueado
router.use(protegerRuta, autorizarJefe);

router.get("/", getDepartamentos);
router.post("/", createDepartamento);
router.put("/:id", updateDepartamento);
router.delete("/:id", deleteDepartamento);
router.put("/:id/lider", asignarLider);

export default router;
