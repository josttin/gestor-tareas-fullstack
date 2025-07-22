// src/controllers/usuarios.controller.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre_completo, email, password, rol } = req.body;

    if (!nombre_completo || !email || !password || !rol) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    // Corregido: Usa $1 y maneja el resultado de pg
    const { rows: userExists } = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    if (userExists.length > 0) {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Corregido: Usa $1, $2, etc., añade RETURNING id y maneja el resultado de pg
    const result = await pool.query(
      "INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id",
      [nombre_completo, email, hashedPassword, rol]
    );

    res.status(201).json({
      id: result.rows[0].id, // Se obtiene el id desde result.rows
      message: "Usuario registrado exitosamente.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al registrar el usuario." });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios." });
    }

    // Corregido: Usa $1 y maneja el resultado de pg
    const { rows: users } = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }
    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const payload = {
      id: user.id,
      rol: user.rol,
      nombre: user.nombre_completo,
      departamento_id: user.departamento_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Inicio de sesión exitoso.",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor al iniciar sesión." });
  }
};

export const verPerfil = (req, res) => {
  const perfilUsuario = {
    id: req.user.id,
    nombre: req.user.nombre,
    rol: req.user.rol,
  };
  res.json(perfilUsuario);
};

export const obtenerEmpleados = async (req, res) => {
  try {
    // Corregido: Maneja el resultado de pg
    const { rows: empleados } = await pool.query(
      "SELECT id, nombre_completo, departamento_id FROM usuarios WHERE rol = 'empleado'"
    );
    res.json(empleados);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener la lista de empleados." });
  }
};

export const asignarDepartamento = async (req, res) => {
  const { usuarioId } = req.params;
  const { departamento_id } = req.body;

  // --- LOGS PARA DEPURACIÓN ---
  console.log("--- Intentando asignar departamento ---");
  console.log(
    "ID de Usuario a modificar:",
    usuarioId,
    "(tipo: " + typeof usuarioId + ")"
  );
  console.log(
    "Nuevo ID de Departamento:",
    departamento_id,
    "(tipo: " + typeof departamento_id + ")"
  );
  // ---------------------------

  try {
    const result = await pool.query(
      "UPDATE usuarios SET departamento_id = $1 WHERE id = $2 AND rol = 'empleado' RETURNING id, nombre_completo, departamento_id",
      [departamento_id, usuarioId]
    );

    // --- MÁS LOGS ---
    console.log("Filas afectadas por el UPDATE:", result.rowCount);
    console.log("Datos devueltos por la BD:", result.rows);
    // ------------------

    if (result.rowCount === 0) {
      console.log("El UPDATE no encontró al empleado o no realizó cambios.");
      return res
        .status(404)
        .json({ message: "Empleado no encontrado o datos idénticos." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    // --- LOG DE ERROR ---
    console.error("ERROR DETALLADO en asignarDepartamento:", error);
    // --------------------
    res.status(500).json({ message: "Error al asignar el departamento." });
  }
};

// Obtener todos los usuarios (para el admin)
export const getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nombre_completo, email, rol, departamento_id FROM usuarios ORDER BY id ASC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios." });
  }
};

// Actualizar un usuario (para el admin)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Obtenemos solo los campos que se envían

  try {
    // 1. Obtenemos los datos actuales del usuario desde la BD
    const userResult = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    const currentUser = userResult.rows[0];

    // 2. Fusionamos los datos actuales con los nuevos que llegaron
    const updatedUser = {
      nombre_completo: updates.nombre_completo || currentUser.nombre_completo,
      email: updates.email || currentUser.email,
      rol: updates.rol || currentUser.rol,
    };

    // 3. Ejecutamos la actualización con el objeto completo y fusionado
    const { rows } = await pool.query(
      "UPDATE usuarios SET nombre_completo = $1, email = $2, rol = $3 WHERE id = $4 RETURNING id, nombre_completo, email, rol",
      [updatedUser.nombre_completo, updatedUser.email, updatedUser.rol, id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar el usuario." });
  }
};

// Eliminar un usuario (para el admin)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
};
