// src/controllers/dashboard.controller.js
import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const tasksByStatusQuery = `SELECT estado, COUNT(*) as count FROM tareas GROUP BY estado;`;

    const tasksByDepartmentQuery = `SELECT d.nombre, COUNT(t.id) as count FROM departamentos d LEFT JOIN tareas t ON d.id = t.departamento_id GROUP BY d.nombre;`;

    const tasksByUserQuery = `
      SELECT u.nombre_completo as name, COUNT(t.id) as count 
      FROM tareas t 
      JOIN usuarios u ON t.asignado_id = u.id 
      WHERE t.estado = 'completada' 
      GROUP BY u.nombre_completo 
      ORDER BY count DESC;
    `;

    const avgTimeToCompleteQuery = `
      SELECT 
        u.nombre_completo as name, 
        AVG(t.fecha_completada - t.fecha_creacion) as avg_duration 
      FROM tareas t 
      JOIN usuarios u ON t.asignado_id = u.id 
      WHERE t.estado = 'completada' AND t.fecha_completada IS NOT NULL
      GROUP BY u.nombre_completo;
    `;

    const [
      tasksByStatusResult,
      tasksByDepartmentResult,
      tasksByUserResult,
      avgTimeToCompleteResult,
    ] = await Promise.all([
      pool.query(tasksByStatusQuery),
      pool.query(tasksByDepartmentQuery),
      pool.query(tasksByUserQuery),
      pool.query(avgTimeToCompleteQuery),
    ]);

    const stats = {
      tasksByStatus: tasksByStatusResult.rows,
      tasksByDepartment: tasksByDepartmentResult.rows,
      tasksCompletedByUser: tasksByUserResult.rows,
      avgCompletionTime: avgTimeToCompleteResult.rows,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener las estadísticas." });
  }
};
