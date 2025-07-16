// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

export const protegerRuta = (req, res, next) => {
  // 1. Obtener el token del encabezado de autorización
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. No se proporcionó un token." });
  }

  // El formato del header es "Bearer TOKEN"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Formato de token inválido." });
  }

  // 2. Verificar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 3. Añadir la información del usuario decodificada a la petición
    req.user = decoded;
    next(); // <-- Si todo es correcto, pasa al siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

export const autorizarJefe = (req, res, next) => {
  // Este middleware se ejecuta DESPUÉS de protegerRuta,
  // por lo que ya tenemos acceso a req.user
  if (req.user.rol !== "jefe") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
  next();
};
