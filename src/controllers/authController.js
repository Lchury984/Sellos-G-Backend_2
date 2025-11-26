import Admin from '../models/Admin.js';
import Cliente from '../models/Cliente.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Necesario para hashear si se actualiza la contraseña
import nodemailer from "nodemailer"; // Necesario para la recuperación de contraseña

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
    // 1. Buscar en la colección de ADMINISTRADORES
    usuario = await Admin.findOne({ correo });
    if (usuario) {
      rol = 'administrador';
    }

    // 2. Si no es Admin, buscar en la colección de CLIENTES
    if (!usuario) {
      usuario = await Cliente.findOne({ correo });
      if (usuario) {
        rol = 'cliente';
      }
    }

    // 3. Si el usuario no se encuentra en ninguna colección relevante:
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    // 4. Comparar la contraseña (Usamos .compararPassword según la asunción)
    // ⚠️ IMPORTANTE: Asegúrate que este método esté definido en tus modelos (Admin.js y Cliente.js)
    const esValido = await usuario.compararPassword(password);

    if (!esValido) return res.status(401).json({ msg: "Contraseña incorrecta" });

    // 5. Generación de Token y Respuesta
    const token = generarToken(usuario._id, rol);

    res.json({
      msg: "Inicio de sesión exitoso",
      token,
      rol: rol,
      // Añadir la información mínima del usuario para el Frontend
      user: {
        id: usuario._id,
        correo: usuario.correo,
        nombre: usuario.nombre || 'Usuario', // Usar 'Usuario' si no tiene nombre
        rol: rol
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ msg: "Error al iniciar sesión" });
  }
};

// ====================================================================
// --- 2. Recuperación de Contraseña ---
// ====================================================================
export const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;
  try {
    // ⚠️ Para la recuperación, idealmente debes buscar en TODOS los modelos (Admin, Cliente)
    const usuario = await Admin.findOne({ correo }) || await Cliente.findOne({ correo });
    if (!usuario) return res.status(404).json({ msg: "Correo no registrado" });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // ⚠️ Asegúrate de que el modelo Mongoose tenga los campos tokenRecuperacion y expiracionToken
    usuario.tokenRecuperacion = token;
    usuario.expiracionToken = Date.now() + 3600000;
    await usuario.save();

    // Configuración del correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const enlace = `http://localhost:3000/api/auth/restablecer/${token}`;
    await transporter.sendMail({
      to: usuario.correo,
      subject: "Recuperación de contraseña",
      html: `<p>Para restablecer tu contraseña haz clic en el siguiente enlace:</p>
             <a href="${enlace}">${enlace}</a>`,
    });

    res.json({ msg: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    res.status(500).json({ msg: "Error al procesar la solicitud" });
  }
};

// ====================================================================
// --- 3. Restablecer Contraseña ---
// ====================================================================
export const restablecerContraseña = async (req, res) => {
  const { token } = req.params;
  const { nuevaContraseña } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Buscar en Admin y Cliente, ya que no sabemos qué tipo de usuario es
    let usuario = await Admin.findById(decoded.id);
    if (!usuario) {
      usuario = await Cliente.findById(decoded.id);
    }

    if (!usuario || usuario.tokenRecuperacion !== token || usuario.expiracionToken < Date.now())
      return res.status(400).json({ msg: "Token inválido o expirado" });

    // ⚠️ Asumimos que el campo en el modelo es 'password' y Mongoose lo hashea antes de guardar
    usuario.password = nuevaContraseña;
    usuario.tokenRecuperacion = null;
    usuario.expiracionToken = null;
    await usuario.save();

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ msg: "Error al restablecer la contraseña" });
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