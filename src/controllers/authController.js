import Admin from '../models/Admin.js';
import Empleado from '../models/Empleado.js';
import Cliente from '../models/Cliente.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Necesario para hashear si se actualiza la contraseña
import nodemailer from "nodemailer"; // Necesario para la recuperación de contraseña

// 🚀 CORRECCIÓN 1: Importar randomBytes directamente de 'crypto'
import { randomBytes } from 'crypto';

// 🚀 CORRECCIÓN 2: Importar la utilidad de envío de correo (Buenas Prácticas)
import { sendPasswordResetEmail } from '../utils/emailSender.js';
import { sendEmployeeWelcomeEmail } from '../utils/emailSender.js';

// Función auxiliar para generar JWT
const generarToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ====================================================================
// --- 1. Iniciar Sesión (Login) ---
// ====================================================================
// En authController.js

export const login = async (req, res) => {
  const { correo, password } = req.body;
  let usuario = null;
  let rol = null;

  try {
    // 1. Buscar ADMIN
    usuario = await Admin.findOne({ correo });
    if (usuario) rol = "administrador";

    // 2. Buscar EMPLEADO
    if (!usuario) {
      usuario = await Empleado.findOne({ correo });
      if (usuario) rol = "empleado";
    }

    // 3. Buscar CLIENTE
    if (!usuario) {
      usuario = await Cliente.findOne({ correo });
      if (usuario) rol = "cliente";
    }

    // 4. Usuario no existe
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // 5. VALIDACIÓN: verificar correo (excepto admin y empleados creados por admin)
    if (rol === "cliente" && !usuario.verificado) {
      return res.status(401).json({
        msg: "Tu cuenta no ha sido verificada. Revisa tu correo electrónico.",
        necesitaVerificar: true
      });
    }

    // 6. Comparar contraseña
    const esValido = await usuario.compararPassword(password);
    if (!esValido) {
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    // 7. Generar JWT
    const token = jwt.sign({ id: usuario._id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // 8. Respuesta final
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
  // Aceptamos token tanto por body como por query (por si el frontend envía de distinta forma)
  const token = req.body?.token || req.query?.token;

  if (!token) {
    return res.status(400).json({ message: 'Token de verificación no proporcionado.' });
  }

  try {
    // Intentar encontrar el usuario (Empleado o Cliente) cuyo token coincide y que no haya expirado
    let usuario = await Empleado.findOne({
      verificacionToken: token,
      verificacionExpira: { $gt: Date.now() }
    });
    let tipo = 'empleado';

    if (!usuario) {
      usuario = await Cliente.findOne({
        verificacionToken: token,
        verificacionExpira: { $gt: Date.now() }
      });
      tipo = 'cliente';
    }

    if (!usuario) {
      // Para ayudar a depurar, verificamos si existe algún usuario con ese token (incluso expirado)
      const posibleEmpleado = await Empleado.findOne({ verificacionToken: token });
      const posibleCliente = await Cliente.findOne({ verificacionToken: token });

      if (posibleEmpleado) {
        console.warn(`Verificación: token encontrado pero expirado para empleado ${posibleEmpleado.correo}`);
        return res.status(400).json({ message: 'Token expirado. Por favor solicita uno nuevo.' });
      }

      if (posibleCliente) {
        console.warn(`Verificación: token encontrado pero expirado para cliente ${posibleCliente.correo}`);
        return res.status(400).json({ message: 'Token expirado. Por favor solicita uno nuevo.' });
      }

      console.warn(`Verificación fallida: token no encontrado (${token})`);
      return res.status(400).json({ message: 'Token de verificación inválido o no encontrado.' });
    }

    usuario.verificado = true;
    usuario.verificacionToken = null;
    usuario.verificacionExpira = null;

    await usuario.save();

    res.status(200).json({ message: `Correo electrónico verificado con éxito (${tipo}). ¡Ya puedes iniciar sesión!` });

  } catch (error) {
    console.error('Error en verificarEmail:', error);
    res.status(500).json({ message: 'Error en el servidor durante la verificación.' });
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
export const actualizarContraseña = async (req, res) => {
  const currentPassword = req.body?.contraseñaActual || req.body?.currentPassword;
  const newPassword = req.body?.nuevaContraseña || req.body?.newPassword;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: "Datos incompletos" });
  }

  const userId = req.usuario?.id || req.usuario?._id;

  let usuario = await Admin.findById(userId);
  let rol = 'administrador';

  if (!usuario) {
    usuario = await Cliente.findById(userId);
    rol = 'cliente';
  }

  if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado." });

  const coincide = await usuario.compararPassword(currentPassword);
  if (!coincide) return res.status(400).json({ msg: "La contraseña actual es incorrecta" });

  usuario.password = newPassword; // se hashea en el pre('save')
  await usuario.save();

  res.json({ msg: "Contraseña actualizada", rol });
};

// Endpoint de ayuda para enviar un correo de verificación de prueba (solo en development)
export const sendTestEmail = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ msg: 'Endpoint disponible solo en entorno de desarrollo.' });
  }

  const { correo, nombre } = req.body;
  if (!correo) return res.status(400).json({ msg: 'Debe indicar un correo destino en el body { correo }' });

  try {
    const token = randomBytes(32).toString('hex');
    await sendEmployeeWelcomeEmail(correo, token, nombre || 'Prueba');
    return res.json({ msg: 'Correo de prueba enviado' });
  } catch (e) {
    console.error('Error enviando correo de prueba:', e);
    return res.status(500).json({ msg: 'Error enviando correo de prueba', error: e.message });
  }
};

// Reenviar token de verificación a un correo (empleado o cliente)
export const resendVerification = async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ msg: 'Correo requerido' });

  try {
    let usuario = await Empleado.findOne({ correo }) || await Cliente.findOne({ correo });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    if (usuario.verificado) return res.status(400).json({ msg: 'Usuario ya verificado' });

    const token = randomBytes(32).toString('hex');
    const expiration = Date.now() + 3600000; // 1 hora

    usuario.verificacionToken = token;
    usuario.verificacionExpira = expiration;
    await usuario.save();

    // Enviar el correo según tipo (Empleado -> sendEmployeeWelcomeEmail, Cliente -> sendVerificationEmail)
    if (usuario.rol === 'empleado') {
      await sendEmployeeWelcomeEmail(correo, token, usuario.nombre || 'Empleado');
    } else {
      await sendVerificationEmail(correo, token, usuario.nombre || 'Usuario');
    }

    res.json({ msg: 'Token de verificación reenviado' });
  } catch (error) {
    console.error('Error reenviando verificación:', error);
    res.status(500).json({ msg: 'Error reenviando verificación', error: error.message });
  }
};