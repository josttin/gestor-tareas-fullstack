// src/controllers/comentarios.controller.js
import pool from "../config/db.js";

// Obtener todos los comentarios de una tarea
export const getComentariosPorTarea = async (req, res) => {
  const { tareaId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT c.*, u.nombre_completo as autor
       FROM comentarios c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.tarea_id = $1
       ORDER BY c.fecha_creacion DESC`,
      [tareaId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener comentarios." });
  }
};

// Crear un nuevo comentario en una tarea
export const createComentario = async (req, res) => {
  const { tareaId } = req.params;
  const { contenido } = req.body;
  const usuario_id = req.user.id; // El ID viene del token

  if (!contenido) {
    return res
      .status(400)
      .json({ message: "El contenido no puede estar vacío." });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO comentarios (contenido, tarea_id, usuario_id) VALUES ($1, $2, $3) RETURNING *",
      [contenido, tareaId, usuario_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el comentario." });
  }
};
