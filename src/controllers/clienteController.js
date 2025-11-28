// src/controllers/clienteController.js

import Cliente from '../models/Cliente.js';
import { sendVerificationEmail } from '../utils/emailSender.js';
import crypto from 'crypto';

export const registrarCliente = async (req, res) => {
  const { correo, password, nombre } = req.body;

  try {
    // 1. Validar si ya existe
    let existente = await Cliente.findOne({ correo });
    if (existente) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    // 2. Generar token de verificación
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hora

    // 3. Crear cliente con los nuevos campos
    const cliente = new Cliente({
      correo,
      password,
      nombre,
      verificado: false,
      verificacionToken: token,
      verificacionExpira: expiration
    });

    await cliente.save();

    // 4. Enviar correo
    await sendVerificationEmail(correo, token, nombre);

    res.status(201).json({
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.'
    });

  } catch (error) {
    console.error("Error en registrarCliente:", error);
    res.status(500).json({ message: "Error al registrar cliente", error });
  }
};


// 🔹 Obtener todos los clientes
export const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes", error });
  }
};

// Actualizar cliente (solo admin)
export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, edad } = req.body;

    const actualizado = await Cliente.findByIdAndUpdate(
      id,
      { nombre, correo, edad },
      { new: true }
    ).select('-password');

    if (!actualizado) return res.status(404).json({ msg: 'Cliente no encontrado' });

    res.json({ msg: 'Cliente actualizado', cliente: actualizado });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ msg: 'Error al actualizar cliente', error: error.message });
  }
};

// Eliminar cliente (solo admin)
export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Cliente.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ msg: 'Cliente no encontrado' });
    res.json({ msg: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ msg: 'Error al eliminar cliente', error: error.message });
  }
};
