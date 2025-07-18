// src/controllers/solicitudes.controller.js
import pool from "../config/db.js";

// Empleado: Crear una nueva solicitud
export const createSolicitud = async (req, res) => {
  const { tipo, motivo, tarea_id } = req.body;
  const solicitante_id = req.user.id; // ID viene del token del empleado logueado

  if (!tipo || !motivo) {
    return res
      .status(400)
      .json({ message: "El tipo y el motivo son obligatorios." });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO solicitudes (tipo, motivo, tarea_id, solicitante_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [tipo, motivo, tarea_id || null, solicitante_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la solicitud." });
  }
};

// Empleado: Ver sus propias solicitudes
export const getMisSolicitudes = async (req, res) => {
  const solicitante_id = req.user.id;
  try {
    const { rows } = await pool.query(
      "SELECT s.*, t.titulo as titulo_tarea FROM solicitudes s LEFT JOIN tareas t ON s.tarea_id = t.id WHERE s.solicitante_id = $1 ORDER BY s.fecha_creacion DESC",
      [solicitante_id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tus solicitudes." });
  }
};

// Jefe: Ver todas las solicitudes pendientes
export const getAllSolicitudes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT s.*, u.nombre_completo as nombre_solicitante, t.titulo as titulo_tarea FROM solicitudes s JOIN usuarios u ON s.solicitante_id = u.id LEFT JOIN tareas t ON s.tarea_id = t.id WHERE s.estado = 'pendiente' ORDER BY s.fecha_creacion ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener todas las solicitudes." });
  }
};

// Jefe: Actualizar el estado de una solicitud (aprobar/rechazar)
export const updateSolicitudStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado || (estado !== "aprobada" && estado !== "rechazada")) {
    return res
      .status(400)
      .json({ message: "El estado debe ser 'aprobada' o 'rechazada'." });
  }

  try {
    const { rows } = await pool.query(
      "UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la solicitud." });
  }
};
