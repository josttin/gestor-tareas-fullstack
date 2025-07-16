// src/controllers/tareas.controller.js
import pool from "../config/db.js";

export const crearTarea = async (req, res) => {
  try {
    // 1. Obtener los datos de la tarea del cuerpo de la petición
    const { titulo, descripcion, fecha_limite, asignado_id, departamento_id } =
      req.body;

    // El ID del jefe que crea la tarea lo tomamos del token
    const creador_id = req.user.id;

    if (!titulo || !asignado_id) {
      return res
        .status(400)
        .json({ message: "El título y el ID del asignado son obligatorios." });
    }

    // 2. Insertar la nueva tarea en la base de datos
    const [result] = await pool.query(
      "INSERT INTO tareas (titulo, descripcion, fecha_limite, creador_id, asignado_id, departamento_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        titulo,
        descripcion,
        fecha_limite,
        creador_id,
        asignado_id,
        departamento_id || null,
      ]
    );

    // 3. Responder con la nueva tarea creada
    res.status(201).json({
      id: result.insertId,
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
    // El ID del usuario logueado lo obtenemos del token gracias al middleware
    const usuarioId = req.user.id;

    const [tareas] = await pool.query(
      "SELECT * FROM tareas WHERE asignado_id = ?",
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
    const { id } = req.params; // Obtenemos el ID de la tarea de la URL
    const { estado } = req.body; // Obtenemos el nuevo estado del cuerpo de la petición
    const usuarioId = req.user.id; // Obtenemos el ID del usuario del token

    if (!estado) {
      return res
        .status(400)
        .json({ message: "El campo estado es obligatorio." });
    }

    // 1. Verificar que la tarea existe y a quién pertenece
    const [tareas] = await pool.query("SELECT * FROM tareas WHERE id = ?", [
      id,
    ]);
    if (tareas.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const tarea = tareas[0];

    // 2. Autorización: solo el usuario asignado puede cambiar el estado
    if (tarea.asignado_id !== usuarioId) {
      return res
        .status(403)
        .json({ message: "Acceso denegado. No puedes modificar esta tarea." });
    }

    // 3. Actualizar el estado de la tarea
    await pool.query("UPDATE tareas SET estado = ? WHERE id = ?", [estado, id]);

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
    const { id } = req.params; // ID de la tarea desde la URL
    const usuarioId = req.user.id; // ID del usuario desde el token

    // 1. Verificar que la tarea existe
    const [tareas] = await pool.query("SELECT * FROM tareas WHERE id = ?", [
      id,
    ]);
    if (tareas.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }
    const tarea = tareas[0];

    // 2. Autorización: solo el jefe que la creó puede eliminarla
    if (tarea.creador_id !== usuarioId) {
      return res.status(403).json({
        message: "Acceso denegado. No tienes permiso para eliminar esta tarea.",
      });
    }

    // 3. Eliminar la tarea
    await pool.query("DELETE FROM tareas WHERE id = ?", [id]);

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
    // Usamos un JOIN para traer también el nombre del usuario asignado
    const [tareas] = await pool.query(`
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
