// controllers/empleadoController.js

import Empleado from "../models/Empleado.js";
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
