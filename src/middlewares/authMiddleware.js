import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Empleado from "../models/Empleado.js";
import Cliente from "../models/Cliente.js";



// Middleware general para verificar token
export const protegerRuta = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    let usuario;

    // 1. Intentar buscar en Administradores
    usuario = await Admin.findById(userId).select("-password");

    // 2. Si no se encuentra, buscar en Empleados
    if (!usuario) {
      usuario = await Empleado.findById(userId).select("-password");
    }

    // 3. Si no se encuentra, buscar en Clientes
    if (!usuario) {
      usuario = await Cliente.findById(userId).select("-password");
    }

    req.usuario = usuario;

    if (!req.usuario) return res.status(404).json({ msg: "Usuario no encontrado" });
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

// Middleware para administradores
export const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== "administrador") {
    return res.status(403).json({ msg: "Acceso denegado: Solo administradores" });
  }
  next();
};

// Middleware para empleados
export const soloEmpleado = (req, res, next) => {
  if (req.usuario.rol !== "empleado" && req.usuario.rol !== "administrador") {
    return res.status(403).json({ msg: "Acceso denegado: Solo empleados o administradores" });
  }
  next();
};

// Middleware para clientes autenticados
export const soloCliente = (req, res, next) => {
  if (req.usuario.rol !== "cliente") {
    return res.status(403).json({ msg: "Acceso denegado: Solo clientes" });
  }
  next();
};

