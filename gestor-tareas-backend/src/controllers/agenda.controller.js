// src/controllers/agenda.controller.js
import pool from "../config/db.js";

export const getEventosDelMes = async (req, res) => {
  // Recibimos el año y el mes desde la URL, ej: /eventos?anio=2025&mes=8
  const { anio, mes } = req.query;
  const jefe_id = req.user.id;

  if (!anio || !mes) {
    return res.status(400).json({ message: "El año y el mes son requeridos." });
  }

  try {
    // 1. Buscamos las tareas que tienen fecha límite en ese mes
    const tareasQuery = `
            SELECT id, titulo, fecha_limite as fecha, 'tarea' as tipo
            FROM tareas
            WHERE EXTRACT(YEAR FROM fecha_limite) = $1 AND EXTRACT(MONTH FROM fecha_limite) = $2;
        `;
    const { rows: tareas } = await pool.query(tareasQuery, [anio, mes]);

    // 2. Buscamos los compromisos personales del jefe en ese mes
    const compromisosQuery = `
            SELECT id, titulo, fecha, 'compromiso' as tipo
            FROM compromisos
            WHERE jefe_id = $1 AND EXTRACT(YEAR FROM fecha) = $2 AND EXTRACT(MONTH FROM fecha) = $3;
        `;
    const { rows: compromisos } = await pool.query(compromisosQuery, [
      jefe_id,
      anio,
      mes,
    ]);

    // Por ahora, devolvemos un array vacío para los permisos. Lo implementaremos después.
    const permisos = [];

    // 3. Unimos todos los resultados en un solo objeto
    res.json({ tareas, permisos, compromisos });
  } catch (error) {
    console.error("Error al obtener eventos de la agenda:", error);
    res.status(500).json({ message: "Error al obtener datos de la agenda." });
  }
};
