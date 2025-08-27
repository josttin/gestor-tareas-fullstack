// src/controllers/compromisos.controller.js
import pool from "../config/db.js";

// Crear un nuevo compromiso
export const createCompromiso = async (req, res) => {
  const { titulo, descripcion, fecha } = req.body;
  const jefe_id = req.user.id;

  if (!titulo || !fecha) {
    return res
      .status(400)
      .json({ message: "El título y la fecha son obligatorios." });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO compromisos (titulo, descripcion, fecha, jefe_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [titulo, descripcion, fecha, jefe_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear compromiso:", error);
    res.status(500).json({ message: "Error al crear el compromiso." });
  }
};

// Eliminar un compromiso
export const deleteCompromiso = async (req, res) => {
  const { id } = req.params;
  const jefe_id = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM compromisos WHERE id = $1 AND jefe_id = $2",
      [id, jefe_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "Compromiso no encontrado o no tienes permiso para eliminarlo.",
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar compromiso:", error);
    res.status(500).json({ message: "Error al eliminar el compromiso." });
  }
};
