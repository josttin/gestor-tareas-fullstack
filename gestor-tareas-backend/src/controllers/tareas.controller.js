// src/controllers/tareas.controller.js
import pool from "../config/db.js";

export const crearTarea = async (req, res) => {
  try {
    // Añadimos sub_fechas a la desestructuración
    const {
      titulo,
      descripcion,
      fecha_limite,
      asignado_id,
      departamento_id,
      sub_fechas,
    } = req.body;
    const creador_id = req.user.id;

    if (!titulo || (!asignado_id && !departamento_id)) {
      return res.status(400).json({
        message:
          "El título y un asignado (empleado o departamento) son obligatorios.",
      });
    }

    const result = await pool.query(
      // Añadimos la nueva columna a la consulta
      "INSERT INTO tareas (titulo, descripcion, fecha_limite, creador_id, asignado_id, departamento_id, sub_fechas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [
        titulo,
        descripcion,
        fecha_limite,
        creador_id,
        asignado_id || null,
        departamento_id || null,
        sub_fechas || null, // Aceptamos las sub_fechas
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

    const { rows: tareas } = await pool.query(
      "SELECT * FROM tareas WHERE id = $1",
      [id]
    );
    if (tareas.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const tarea = tareas[0];
    let tienePermiso = false;

    // Permiso 1: El usuario es el asignado directamente a la tarea
    if (tarea.asignado_id === usuarioId) {
      tienePermiso = true;
    }

    // Permiso 2: La tarea es de un departamento y el usuario es el líder de ese departamento
    if (!tienePermiso && tarea.departamento_id) {
      const { rows: deptos } = await pool.query(
        "SELECT lider_id FROM departamentos WHERE id = $1",
        [tarea.departamento_id]
      );
      if (deptos.length > 0 && deptos[0].lider_id === usuarioId) {
        tienePermiso = true;
      }
    }

    if (!tienePermiso) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para modificar esta tarea." });
    }

    // Si tiene permiso, actualiza la tarea
    let query =
      "UPDATE tareas SET estado = $1, fecha_completada = CASE WHEN $1 = 'completada' THEN NOW() ELSE NULL END WHERE id = $2";
    await pool.query(query, [estado, id]);

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
    // 1. Extraer parámetros de la URL (query params)
    const { page = 1, limit = 10, empleadoId, departamentoId } = req.query;
    const offset = (page - 1) * limit;

    // 2. Construir la consulta dinámicamente
    let query = `
      SELECT 
        t.*, 
        u.nombre_completo as nombre_asignado 
      FROM tareas t 
      LEFT JOIN usuarios u ON t.asignado_id = u.id
    `;
    const whereClauses = [];
    const queryParams = [];

    if (empleadoId) {
      queryParams.push(empleadoId);
      whereClauses.push(`t.asignado_id = $${queryParams.length}`);
    }
    if (departamentoId) {
      queryParams.push(departamentoId);
      whereClauses.push(`t.departamento_id = $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += ` ORDER BY t.fecha_creacion DESC LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // 3. Ejecutar la consulta para obtener las tareas
    const tareasResult = await pool.query(query, queryParams);

    // 4. Hacer una segunda consulta para contar el total de páginas
    let countQuery = `SELECT COUNT(*) FROM tareas t`;
    if (whereClauses.length > 0) {
      // Reusamos los WHERE de la consulta principal, pero sin los params de limit/offset
      countQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const totalTareas = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalTareas / limit);

    // 5. Enviar la respuesta completa
    res.json({
      tareas: tareasResult.rows,
      currentPage: parseInt(page, 10),
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener todas las tareas." });
  }
};

export const getTareaById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM tareas WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la tarea." });
  }
};

// Devuelve las tareas asignadas al departamento del usuario logueado
export const getTareasPorDepartamento = async (req, res) => {
  // Log de entrada a la función
  console.log("--- ENTRANDO A getTareasPorDepartamento ---");
  try {
    console.log("Usuario que llegó al controlador:", req.user);
    const departamentoId = req.user.departamento_id;

    console.log(`Departamento ID del usuario: ${departamentoId}`);

    if (!departamentoId) {
      console.log("El usuario no tiene departamento, devolviendo array vacío.");
      return res.json([]);
    }

    console.log(`Ejecutando consulta para departamento ID: ${departamentoId}`);
    const { rows } = await pool.query(
      "SELECT * FROM tareas WHERE departamento_id = $1",
      [departamentoId]
    );
    console.log(`Consulta exitosa, se encontraron ${rows.length} tareas.`);
    res.json(rows);
  } catch (error) {
    console.error("--- ERROR DENTRO de getTareasPorDepartamento ---:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las tareas del departamento." });
  }
};
