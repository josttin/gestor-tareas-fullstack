// src/controllers/solicitudes.controller.js
import pool from "../config/db.js";

// Empleado: Crear una nueva solicitud
export const createSolicitud = async (req, res) => {
  // Añadimos fecha_sugerida
  const { tipo, motivo, tarea_id, fecha_sugerida } = req.body;
  const solicitante_id = req.user.id;

  if (!tipo || !motivo) {
    return res
      .status(400)
      .json({ message: "El tipo y el motivo son obligatorios." });
  }

  try {
    const { rows } = await pool.query(
      // Añadimos la nueva columna
      "INSERT INTO solicitudes (tipo, motivo, tarea_id, solicitante_id, fecha_sugerida) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tipo, motivo, tarea_id || null, solicitante_id, fecha_sugerida || null]
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
  // El jefe ahora puede enviar una fecha_limite_final
  const { estado, fecha_limite_final } = req.body;

  if (!estado || (estado !== "aprobada" && estado !== "rechazada")) {
    return res
      .status(400)
      .json({ message: "El estado debe ser 'aprobada' o 'rechazada'." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const solicitudResult = await client.query(
      "UPDATE solicitudes SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    if (solicitudResult.rows.length === 0) {
      throw new Error("Solicitud no encontrada.");
    }

    const solicitud = solicitudResult.rows[0];

    // Si se aprueba Y se proporciona una fecha final, actualizamos la tarea
    if (estado === "aprobada" && fecha_limite_final && solicitud.tarea_id) {
      await client.query("UPDATE tareas SET fecha_limite = $1 WHERE id = $2", [
        fecha_limite_final,
        solicitud.tarea_id,
      ]);
    }

    await client.query("COMMIT");
    res.json(solicitud);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la solicitud." });
  } finally {
    client.release();
  }
};
