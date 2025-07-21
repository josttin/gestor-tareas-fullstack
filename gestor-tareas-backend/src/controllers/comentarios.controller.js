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
    // Añade este console.error para ver el detalle
    console.error("Error detallado en getComentariosPorTarea:", error);
    res.status(500).json({ message: "Error al obtener comentarios." });
  }
};

// Crear un nuevo comentario en una tarea
export const createComentario = async (req, res) => {
  const { tareaId } = req.params;
  const { contenido } = req.body;
  const usuario_id = req.user.id;
  const archivo = req.file; // El archivo viene de Multer

  // Un comentario debe tener o texto o un archivo
  if (!contenido && !archivo) {
    return res
      .status(400)
      .json({ message: "El comentario no puede estar vacío." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO comentarios 
        (contenido, tarea_id, usuario_id, nombre_archivo, url, public_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        contenido || null,
        tareaId,
        usuario_id,
        archivo?.originalname || null,
        archivo?.path || null,
        archivo?.filename || null,
      ]
    );

    const nuevoComentario = rows[0];
    nuevoComentario.autor = req.user.nombre;
    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error al crear el comentario." });
  }
};
