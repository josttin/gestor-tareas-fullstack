// src/controllers/usuarios.controller.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registrarUsuario = async (req, res) => {
  try {
    // 1. Obtener los datos del cuerpo de la petición
    const { nombre_completo, email, password, rol } = req.body;

    // 2. Validar que los datos necesarios están presentes
    if (!nombre_completo || !email || !password || !rol) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    // 3. Verificar si el email ya existe en la base de datos
    const [userExists] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    if (userExists.length > 0) {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    // 4. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Insertar el nuevo usuario en la base de datos
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre_completo, email, hashedPassword, rol]
    );

    // 6. Responder al cliente
    res.status(201).json({
      id: result.insertId,
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
    // 1. Obtener email y password del cuerpo de la petición
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios." });
    }

    // 2. Buscar al usuario por su email en la base de datos
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      // Usamos un mensaje genérico por seguridad
      return res.status(401).json({ message: "Credenciales inválidas." });
    }
    const user = users[0];

    // 3. Comparar la contraseña proporcionada con la hasheada en la DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // 4. Si las credenciales son correctas, crear el JWT
    const payload = {
      id: user.id,
      rol: user.rol,
      nombre: user.nombre_completo,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // El token expirará en 1 hora
    );

    // 5. Enviar el token al cliente
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
  // La información del usuario fue añadida a req.user por el middleware
  const perfilUsuario = {
    id: req.user.id,
    nombre: req.user.nombre,
    rol: req.user.rol,
  };
  res.json(perfilUsuario);
};

export const obtenerEmpleados = async (req, res) => {
  try {
    const [empleados] = await pool.query(
      "SELECT id, nombre_completo FROM usuarios WHERE rol = 'empleado'"
    );
    res.json(empleados);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener la lista de empleados." });
  }
};
