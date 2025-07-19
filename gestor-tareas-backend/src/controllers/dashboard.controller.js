// src/controllers/dashboard.controller.js
import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Tareas por Estado (pendiente, en_progreso, completada)
    const tasksByStatusQuery = `
      SELECT estado, COUNT(*) as count 
      FROM tareas 
      GROUP BY estado;
    `;

    // 2. Tareas por Departamento
    const tasksByDepartmentQuery = `
      SELECT d.nombre, COUNT(t.id) as count 
      FROM departamentos d 
      LEFT JOIN tareas t ON d.id = t.departamento_id 
      GROUP BY d.nombre;
    `;

    // Ejecutamos ambas consultas en paralelo para mayor eficiencia
    const [tasksByStatusResult, tasksByDepartmentResult] = await Promise.all([
      pool.query(tasksByStatusQuery),
      pool.query(tasksByDepartmentQuery),
    ]);

    // Formateamos la respuesta
    const stats = {
      tasksByStatus: tasksByStatusResult.rows,
      tasksByDepartment: tasksByDepartmentResult.rows,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener las estadísticas." });
  }
};
