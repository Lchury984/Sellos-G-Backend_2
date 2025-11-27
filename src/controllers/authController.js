import Admin from '../models/Admin.js';
import Cliente from '../models/Cliente.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Necesario para hashear si se actualiza la contraseña
import nodemailer from "nodemailer"; // Necesario para la recuperación de contraseña

// 🚀 CORRECCIÓN 1: Importar randomBytes directamente de 'crypto'
import { randomBytes } from 'crypto';

// 🚀 CORRECCIÓN 2: Importar la utilidad de envío de correo (Buenas Prácticas)
import { sendPasswordResetEmail } from '../utils/emailSender.js';

// Función auxiliar para generar JWT
const generarToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ====================================================================
// --- 1. Iniciar Sesión (Login) ---
// ====================================================================
export const login = async (req, res) => {
  const { correo, password } = req.body;
  let usuario = null;
  let rol = null;

  try {
    // 1. Buscar ADMIN
    usuario = await Admin.findOne({ correo });
    if (usuario) rol = "administrador";

    // 2. Buscar CLIENTE si no es admin
    if (!usuario) {
      usuario = await Cliente.findOne({ correo });
      if (usuario) rol = "cliente";
    }

    // 3. Usuario no existe
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // 4. VALIDACIÓN CRÍTICA: cliente debe tener correo verificado
    if (rol === "cliente" && !usuario.verificado) {
      return res.status(401).json({
        msg: "Tu cuenta no ha sido verificada. Revisa tu correo electrónico.",
        necesitaVerificar: true
      });
    }

    // 5. Comparar contraseña
    const esValido = await usuario.compararPassword(password);
    if (!esValido) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    // 6. Generar JWT
    const token = generarToken(usuario._id, rol);

    // 7. Respuesta final
    res.json({
      msg: "Inicio de sesión exitoso",
      token,
      rol,
      user: {
        id: usuario._id,
        correo: usuario.correo,
        nombre: usuario.nombre || "Usuario",
        rol
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ msg: "Error al iniciar sesión" });
  }
};


export const verificarEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const cliente = await Cliente.findOne({
      verificacionToken: token,
      verificacionExpira: { $gt: Date.now() }
    });

    if (!cliente) {
      return res.status(400).json({
        message: "Token de verificación inválido o expirado."
      });
    }

    cliente.verificado = true;
    cliente.verificacionToken = null;
    cliente.verificacionExpira = null;

    await cliente.save();

    res.status(200).json({
      message: "Correo electrónico verificado con éxito. ¡Ya puedes iniciar sesión!"
    });

  } catch (error) {
    res.status(500).json({ message: "Error en el servidor durante la verificación." });
  }
};


// ====================================================================
// --- 2. Recuperación de Contraseña ---
// ====================================================================
export const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    let usuario =
      await Admin.findOne({ correo }) ||
      await Cliente.findOne({ correo });

    // Por seguridad: Siempre respondemos igual
    if (!usuario) {
      return res.json({ msg: "Si el correo existe, enviaremos instrucciones." });
    }

    // Usando randomBytes importado correctamente
    const token = randomBytes(32).toString("hex");
    const expiration = Date.now() + 3600000;

    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpira = expiration;
    await usuario.save();

    // 🚀 CORRECCIÓN 3: Usar la función de utilidad para enviar el correo
    const nombreUsuario = usuario.nombre || 'Usuario';
    await sendPasswordResetEmail(usuario.correo, token, nombreUsuario);


    res.json({ msg: "Correo enviado." });
  } catch (e) {
    console.error("Error al solicitar recuperación:", e);
    res.status(500).json({ msg: "Error interno" });
  }
};

// ====================================================================
// --- 3. Restablecer Contraseña ---
// ====================================================================
export const restablecerContraseña = async (req, res) => {
  const { token } = req.params;
  const { nuevaContraseña } = req.body;

  try {
    let usuario = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpira: { $gt: Date.now() }
    });

    if (!usuario) {
      usuario = await Cliente.findOne({
        resetPasswordToken: token,
        resetPasswordExpira: { $gt: Date.now() }
      });
    }

    if (!usuario) {
      return res.status(400).json({ msg: "Token inválido o expirado" });
    }

    usuario.password = nuevaContraseña;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpira = undefined;

    await usuario.save();

    return res.json({ msg: "Contraseña actualizada" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Error interno" });
  }
};


// ====================================================================
// --- 4. Actualizar Contraseña (Desde perfil, requiere autenticación) ---
// ====================================================================
export const actualizarContraseña = async (req, res) => { // ⬅️ FUNCIÓN FALTANTE
  const { contraseñaActual, nuevaContraseña } = req.body;

  // El middleware `protegerRuta` adjunta la información del usuario a req.usuario
  const userId = req.usuario.id;

  // Buscar el usuario en Admin o Cliente
  let usuario = await Admin.findById(userId);
  let rol = 'administrador';

  if (!usuario) {
    usuario = await Cliente.findById(userId);
    rol = 'cliente';
  }

  if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado." });

  // Usamos el método de comparación definido en el modelo
  const coincide = await usuario.compararPassword(contraseñaActual);
  if (!coincide) return res.status(400).json({ msg: "La contraseña actual es incorrecta" });

  // ⚠️ Asumimos que el campo es 'password' y Mongoose lo hashea
  usuario.password = nuevaContraseña;
  await usuario.save();

  res.json({ msg: "Contraseña actualizada" });
};