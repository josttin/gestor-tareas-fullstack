// src/controllers/tareas.controller.js
import pool from "../config/db.js";

export const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_limite, asignado_id, departamento_id } =
      req.body;
    const creador_id = req.user.id;

    if (!titulo || !asignado_id) {
      return res
        .status(400)
        .json({ message: "El título y el ID del asignado son obligatorios." });
    }

    // Corregido: Usa $n, añade RETURNING id y maneja el resultado
    const result = await pool.query(
      "INSERT INTO tareas (titulo, descripcion, fecha_limite, creador_id, asignado_id, departamento_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [
        titulo,
        descripcion,
        fecha_limite,
        creador_id,
        asignado_id,
        departamento_id || null,
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      titulo,
      descripcion,
      creador_id,
      asignado_id,
      message: "Tarea creada exitosamente.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al crear la tarea." });
  }
};

export const verMisTareas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Corregido: Usa $1 y maneja el resultado de pg
    const { rows: tareas } = await pool.query(
      "SELECT * FROM tareas WHERE asignado_id = $1",
      [usuarioId]
    );

    res.json(tareas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener las tareas." });
  }
};

export const actualizarEstadoTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const usuarioId = req.user.id;

    if (!estado) {
      return res
        .status(400)
        .json({ message: "El campo estado es obligatorio." });
    }

    // Corregido: Usa $1 y maneja el resultado de pg
    const { rows: tareas } = await pool.query(
      "SELECT * FROM tareas WHERE id = $1",
      [id]
    );
    if (tareas.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const tarea = tareas[0];

    if (tarea.asignado_id !== usuarioId) {
      return res
        .status(403)
        .json({ message: "Acceso denegado. No puedes modificar esta tarea." });
    }

    // Corregido: Usa $1, $2
    await pool.query("UPDATE tareas SET estado = $1 WHERE id = $2", [
      estado,
      id,
    ]);

    res.json({ message: "Estado de la tarea actualizado exitosamente." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al actualizar la tarea." });
  }
};

export const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    // Corregido: Usa $1 y maneja el resultado de pg
    const { rows: tareas } = await pool.query(
      "SELECT * FROM tareas WHERE id = $1",
      [id]
    );
    if (tareas.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }
    const tarea = tareas[0];

    if (tarea.creador_id !== usuarioId) {
      return res.status(403).json({
        message: "Acceso denegado. No tienes permiso para eliminar esta tarea.",
      });
    }

    // Corregido: Usa $1
    await pool.query("DELETE FROM tareas WHERE id = $1", [id]);

    res.json({ message: "Tarea eliminada exitosamente." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al eliminar la tarea." });
  }
};

export const verTodasLasTareas = async (req, res) => {
  try {
    // Corregido: Maneja el resultado de pg
    const { rows: tareas } = await pool.query(`
      SELECT 
        t.*, 
        u.nombre_completo as nombre_asignado 
      FROM tareas t 
      LEFT JOIN usuarios u ON t.asignado_id = u.id
    `);
    res.json(tareas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener todas las tareas." });
  }
};
