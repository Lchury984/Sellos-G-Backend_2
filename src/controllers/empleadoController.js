// controllers/empleadoController.js

import Empleado from "../models/Empleado.js";
import Admin from "../models/Admin.js";
import Cliente from "../models/Cliente.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Crear empleado (administrador)
export const crearEmpleado = async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const existe = await Empleado.findOne({ correo });
        if (existe) {
            return res.status(409).json({ msg: "El correo ya está registrado" });
        }

        // Crear token de verificación
        const token = crypto.randomBytes(32).toString("hex");
        const expiration = Date.now() + 3600000; // 1 hora

        const empleado = new Empleado({
            nombre,
            correo,
            password,
            verificado: false,
            verificacionToken: token,
            verificacionExpira: expiration
        });

        await empleado.save();

        // Enviar correo
        await sendVerificationEmail(correo, token, nombre);

        res.status(201).json({
            msg: "Empleado creado correctamente. Debe verificar su correo.",
            empleado
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al crear empleado", error });
    }
};

// Obtener todos los empleados
export const obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.find().select("-password");
        res.json(empleados);
    } catch (error) {
        console.log("Error en obtenerEmpleados:", error);
        res.status(500).json({ msg: "Error al obtener empleados", error });
    }
};

// Actualizar empleado
export const actualizarEmpleado = async (req, res) => {
    const { id } = req.params;

    try {
        const empleado = await Empleado.findByIdAndUpdate(id, req.body, { new: true });
        res.json(empleado);
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar empleado", error });
    }
};

// Eliminar empleado
export const eliminarEmpleado = async (req, res) => {
    const { id } = req.params;

    try {
        await Empleado.findByIdAndDelete(id);
        res.json({ msg: "Empleado eliminado" });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar empleado", error });
    }
};

// Actualizar perfil propio del empleado
export const actualizarPerfilEmpleado = async (req, res) => {
    try {
        const empleadoId = req.usuario?._id || req.usuario?.id;
        if (!empleadoId) return res.status(401).json({ msg: 'No autorizado' });

        const empleado = await Empleado.findById(empleadoId);
        if (!empleado) return res.status(404).json({ msg: 'Empleado no encontrado' });

        const { nombre, correo, password } = req.body || {};

        if (correo && correo !== empleado.correo) {
            const existeAdmin = await Admin.findOne({ correo });
            const existeEmpleado = await Empleado.findOne({ correo });
            const existeCliente = await Cliente.findOne({ correo });
            if ((existeAdmin && existeAdmin._id.toString() !== empleadoId.toString()) ||
                    (existeEmpleado && existeEmpleado._id.toString() !== empleadoId.toString()) ||
                    (existeCliente && existeCliente._id.toString() !== empleadoId.toString())) {
                return res.status(409).json({ msg: 'El correo ya está registrado' });
            }
            empleado.correo = correo;
        }

        if (typeof nombre === 'string' && nombre.trim()) empleado.nombre = nombre.trim();
        if (password && typeof password === 'string' && password.length >= 6) empleado.password = password;

        await empleado.save();

        return res.json({
            msg: 'Perfil actualizado',
            user: {
                id: empleado._id,
                nombre: empleado.nombre,
                correo: empleado.correo,
                rol: 'empleado',
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil del empleado:', error);
        return res.status(500).json({ msg: 'Error al actualizar perfil' });
    }
};
