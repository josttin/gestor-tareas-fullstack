// src/controllers/departamentos.controller.js
import pool from "../config/db.js";

// Obtener todos los departamentos
export const getDepartamentos = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM departamentos ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los departamentos." });
  }
};

// Crear un nuevo departamento
export const createDepartamento = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: "El nombre es obligatorio." });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO departamentos (nombre) VALUES ($1) RETURNING *",
      [nombre]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el departamento." });
  }
};

// Actualizar un departamento
export const updateDepartamento = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: "El nombre es obligatorio." });
  }
  try {
    const { rows } = await pool.query(
      "UPDATE departamentos SET nombre = $1 WHERE id = $2 RETURNING *",
      [nombre, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Departamento no encontrado." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el departamento." });
  }
};

// Eliminar un departamento
export const deleteDepartamento = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM departamentos WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Departamento no encontrado." });
    }
    res.status(204).send(); // 204 No Content: éxito sin devolver nada
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el departamento." });
  }
};
