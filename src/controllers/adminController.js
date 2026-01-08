import Admin from "../models/Admin.js";
import Empleado from "../models/Empleado.js"; // ← Importar Empleado
import Cliente from "../models/Cliente.js";   // ← Importar Cliente
import Producto from "../models/Producto.js";
import Pedido from "../models/Pedido.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmployeeWelcomeEmail } from '../utils/emailSender.js';

// --------------------------
// LOGIN ADMIN
// --------------------------
export const loginAdmin = async (req, res) => {
  const { correo, password } = req.body;

  const admin = await Admin.findOne({ correo });
  if (!admin) return res.status(404).json({ msg: "Administrador no encontrado" });

  const passwordValida = await admin.compararPassword(password);
  if (!passwordValida) return res.status(401).json({ msg: "Contraseña incorrecta" });

  const token = jwt.sign({ id: admin._id, rol: 'administrador' }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ msg: "Login exitoso", token, rol: 'administrador' });
};

// --------------------------
// CRUD ADMINISTRADORES
// --------------------------
export const getAdmins = async (req, res) => {
  const admins = await Admin.find().select("-password");
  res.json(admins);
};

export const createAdmin = async (req, res) => {
  const { nombre, apellido, cedula, telefono, correo, password } = req.body;

  const existe = await Admin.findOne({ correo });
  if (existe) return res.status(400).json({ msg: "El correo ya está registrado" });

  const nuevoAdmin = new Admin({
    nombre,
    apellido,
    cedula,
    telefono,
    correo,
    password
  });
  await nuevoAdmin.save();

  res.status(201).json({ msg: "Administrador creado", nuevoAdmin });
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, cedula, telefono, correo } = req.body;

  const actualizado = await Admin.findByIdAndUpdate(
    id,
    { nombre, apellido, cedula, telefono, correo },
    { new: true }
  ).select("-password");

  if (!actualizado) return res.status(404).json({ msg: "Administrador no encontrado" });

  res.json({ msg: "Administrador actualizado", actualizado });
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const eliminado = await Admin.findByIdAndDelete(id);
  if (!eliminado) return res.status(404).json({ msg: "Administrador no encontrado" });
  res.json({ msg: "Administrador eliminado correctamente" });
};

// --------------------------
// PERFIL PROPIO DE ADMIN
// --------------------------
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.usuario?._id || req.usuario?.id;
    const { nombre, correo } = req.body;

    if (!adminId) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ msg: "Administrador no encontrado" });
    }

    if (correo && correo !== admin.correo) {
      const existing = await Admin.findOne({ correo });
      if (existing && existing._id.toString() !== adminId.toString()) {
        return res.status(409).json({ msg: "El correo ya está registrado" });
      }
      admin.correo = correo;
    }

    if (nombre) {
      admin.nombre = nombre;
    }

    await admin.save();

    return res.json({
      msg: "Perfil actualizado",
      admin: {
        id: admin._id,
        nombre: admin.nombre,
        correo: admin.correo,
        rol: admin.rol || "administrador",
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil de admin:", error);
    return res.status(500).json({ msg: "Error al actualizar perfil" });
  }
};

// --------------------------
// GESTIÓN DE EMPLEADOS
// --------------------------
export const listarEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find().select("-password");
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ msg: "Error al listar empleados", error: error.message });
  }
};

export const crearEmpleado = async (req, res) => {
  try {
    const { nombre, correo, edad } = req.body;

    // Verificar si ya existe
    const existeEmpleado = await Empleado.findOne({ correo });
    if (existeEmpleado) {
      return res.status(400).json({ msg: "El correo ya está registrado como empleado" });
    }

    const existeCliente = await Cliente.findOne({ correo });
    if (existeCliente) {
      return res.status(400).json({ msg: "El correo ya está registrado como cliente" });
    }

    // Usar la contraseña que proporciona el administrador en el formulario
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ msg: 'Debe proporcionar una contraseña para el empleado.' });
    }

    // Generar token de verificación y expiración (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hora

    // Crear empleado y marcarlo como verificado (admin lo crea con acceso inmediato)
    const nuevoEmpleado = new Empleado({
      nombre,
      correo,
      password,
      edad: edad || null,
      rol: "empleado",
      verificado: true,
      verificacionToken: null,
      verificacionExpira: null,
    });

    await nuevoEmpleado.save();

    // Intentar enviar correo de bienvenida (no bloqueante - si falla, el empleado ya está creado y puede iniciar sesión)
    try {
      await sendEmployeeWelcomeEmail(correo, token, nombre);
    } catch (emailError) {
      // Log del error pero no bloquea la respuesta
      console.warn('Advertencia: No se pudo enviar correo de bienvenida al empleado:', emailError.message);
    }

    res.status(201).json({
      msg: "Empleado creado exitosamente",
      empleado: {
        id: nuevoEmpleado._id,
        nombre: nuevoEmpleado.nombre,
        correo: nuevoEmpleado.correo,
        rol: nuevoEmpleado.rol,
        edad: nuevoEmpleado.edad,
        verificado: nuevoEmpleado.verificado,
      }
    });
  } catch (error) {
    console.error("Error al crear empleado:", error);
    res.status(400).json({ msg: "Error al crear empleado", error: error.message });
  }
};

export const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, edad } = req.body;

    const empleadoActualizado = await Empleado.findByIdAndUpdate(
      id,
      { nombre, correo, edad },
      { new: true }
    ).select("-password");

    if (!empleadoActualizado) {
      return res.status(404).json({ msg: "Empleado no encontrado" });
    }

    res.json({ msg: "Empleado actualizado", empleado: empleadoActualizado });
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar empleado", error: error.message });
  }
};

export const eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Empleado.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ msg: "Empleado no encontrado" });
    }

    res.json({ msg: "Empleado eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar empleado", error: error.message });
  }
};

// --------------------------
// REPORTES
// --------------------------
export const generarReporteVentas = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("cliente", "nombre correo")
      .populate("productos.producto", "nombre precio");

    if (!pedidos.length) return res.json({ msg: "No hay ventas registradas" });

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
    const [admins, empleados, clientes] = await Promise.all([
      Admin.find().select("nombre correo"),
      Empleado.find().select("nombre correo rol edad verificado"),
      Cliente.find().select("nombre correo rol edad verificado"),
    ]);

    res.json({
      totalAdmins: admins.length,
      totalEmpleados: empleados.length,
      totalClientes: clientes.length,
      admins,
      empleados,
      clientes,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Exportar reporte de usuarios a CSV
export const exportarReporteCSV = async (req, res) => {
  try {
    const [empleados, clientes] = await Promise.all([
      Empleado.find().select("nombre correo rol edad"),
      Cliente.find().select("nombre correo rol edad"),
    ]);

    const usuarios = [...empleados, ...clientes];

    // Aquí podrías usar una librería como json2csv
    const parser = new Parser({ fields: ["nombre", "correo", "rol", "edad"] });
    const csv = parser.parse(usuarios);

    res.header("Content-Type", "text/csv");
    res.attachment("reporte_usuarios.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
