import Usuario from "../models/Usuario.js";
import Producto from "../models/Producto.js";
import Pedido from "../models/Pedido.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//import { Parser } from "json2csv";

// --------------------------
// LOGIN ADMIN
// --------------------------
export const loginAdmin = async (req, res) => {
  const { correo, password } = req.body;

  const admin = await Usuario.findOne({ correo });
  if (!admin) return res.status(404).json({ msg: "Administrador no encontrado" });
  if (admin.rol !== "administrador") return res.status(403).json({ msg: "Acceso no autorizado" });

  const passwordValida = await bcrypt.compare(password, admin.password);
  if (!passwordValida) return res.status(401).json({ msg: "Contraseña incorrecta" });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ msg: "Login exitoso", token });
};

// --------------------------
// CRUD ADMINISTRADORES
// --------------------------
export const getAdmins = async (req, res) => {
  const admins = await Usuario.find({ rol: "administrador" }).select("-password");
  res.json(admins);
};

export const createAdmin = async (req, res) => {
  const { nombre, correo, password } = req.body;

  const existe = await Usuario.findOne({ correo });
  if (existe) return res.status(400).json({ msg: "El correo ya está registrado" });

  const nuevoAdmin = new Usuario({ nombre, correo, password, rol: "administrador" });
  await nuevoAdmin.save();

  res.status(201).json({ msg: "Administrador creado", nuevoAdmin });
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  const actualizado = await Usuario.findByIdAndUpdate(id, { nombre, correo }, { new: true });
  if (!actualizado) return res.status(404).json({ msg: "Administrador no encontrado" });

  res.json({ msg: "Administrador actualizado", actualizado });
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const eliminado = await Usuario.findByIdAndDelete(id);
  if (!eliminado) return res.status(404).json({ msg: "Administrador no encontrado" });
  res.json({ msg: "Administrador eliminado correctamente" });
};

// --------------------------
// GESTIÓN DE USUARIOS
// --------------------------
export const listarUsuarios = async (req, res) => {
  const usuarios = await Usuario.find({ rol: "empleado" }).select("-password");
  res.json(usuarios);
};

export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { nombre, correo, rol }, { new: true });
  if (!usuarioActualizado) return res.status(404).json({ msg: "Usuario no encontrado" });

  res.json({ msg: "Usuario actualizado", usuarioActualizado });
};

export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  const eliminado = await Usuario.findByIdAndDelete(id);
  if (!eliminado) return res.status(404).json({ msg: "Usuario no encontrado" });
  res.json({ msg: "Usuario eliminado correctamente" });
};

// --------------------------
// REPORTES
// --------------------------
export const generarReporteVentas = async (req, res) => {
  try {
    // Obtenemos todos los pedidos (ventas)
    const pedidos = await Pedido.find()
      .populate("cliente", "nombre correo")
      .populate("productos.producto", "nombre precio");

    if (!pedidos.length) return res.json({ msg: "No hay ventas registradas" });

    // Calcular totales
    const totalVentas = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    const cantidadPedidos = pedidos.length;

    res.json({
      totalVentas,
      cantidadPedidos,
      pedidos,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const generarReporteUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("nombre correo rol");
    const totalAdmins = usuarios.filter(u => u.rol === "administrador").length;
    const totalEmpleados = usuarios.filter(u => u.rol === "empleado").length;

    res.json({
      totalUsuarios: usuarios.length,
      totalAdmins,
      totalEmpleados,
      usuarios,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Exportar reporte de usuarios a CSV
export const exportarReporteCSV = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("nombre correo rol");
    const parser = new Parser({ fields: ["nombre", "correo", "rol"] });
    const csv = parser.parse(usuarios);

    res.header("Content-Type", "text/csv");
    res.attachment("reporte_usuarios.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
