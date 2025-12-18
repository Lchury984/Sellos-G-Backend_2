import Conversacion from "../models/Conversacion.js";
import Mensaje from "../models/Mensaje.js";
import Notificacion from "../models/Notificacion.js";
import Admin from "../models/Admin.js";
import Empleado from "../models/Empleado.js";
import Cliente from "../models/Cliente.js";

const cargarUsuario = async (id) => {
  let usuario = await Admin.findById(id).select("nombre rol");
  if (usuario) return { nombre: usuario.nombre, rol: "administrador", id: usuario._id };
  usuario = await Empleado.findById(id).select("nombre rol");
  if (usuario) return { nombre: usuario.nombre, rol: "empleado", id: usuario._id };
  usuario = await Cliente.findById(id).select("nombre rol");
  if (usuario) return { nombre: usuario.nombre, rol: "cliente", id: usuario._id };
  return null;
};

export const crearConversacion = async (req, res) => {
  try {
    const { userId } = req.body;
    const actual = req.usuario;
    const destino = await cargarUsuario(userId);
    if (!destino) return res.status(404).json({ msg: "Usuario destino no encontrado" });

    // Buscar conversación existente entre ambos
    const existente = await Conversacion.findOne({
      "participantes.usuario": { $all: [actual._id, destino.id] },
      $expr: { $eq: [{ $size: "$participantes" }, 2] }
    });

    if (existente) return res.json(existente.toJSON());

    const nueva = await Conversacion.create({
      participantes: [
        { usuario: actual._id, rol: actual.rol, nombre: actual.nombre },
        { usuario: destino.id, rol: destino.rol, nombre: destino.nombre }
      ]
    });

    res.status(201).json(nueva.toJSON());
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerConversaciones = async (req, res) => {
  try {
    const conversaciones = await Conversacion.find({ "participantes.usuario": req.usuario._id })
      .sort({ updatedAt: -1 });
    res.json(conversaciones.map((c) => c.toJSON()));
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerMensajes = async (req, res) => {
  try {
    const { id } = req.params;
    const mensajes = await Mensaje.find({ conversacion: id }).sort({ createdAt: 1 });
    res.json(mensajes.map((m) => m.toJSON()));
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const crearNotificacionMensaje = async ({ destinatarioId, remitenteNombre, destinatarioRol }) => {
  try {
    await Notificacion.create({
      titulo: "Nuevo mensaje",
      mensaje: `Nuevo mensaje de ${remitenteNombre}`,
      tipo: "mensaje",
      destinatario: destinatarioId,
      destinatarioRol,
      leida: false,
      data: { remitente: remitenteNombre }
    });
  } catch (error) {
    console.error("Error creando notificación de mensaje", error);
  }
};

export const enviarMensaje = async (req, res) => {
  try {
    const { id } = req.params; // conversacion id
    const { mensaje, mediaUrl } = req.body;

    const conversacion = await Conversacion.findById(id);
    if (!conversacion) return res.status(404).json({ msg: "Conversación no encontrada" });

    const nuevo = await Mensaje.create({
      conversacion: id,
      remitente: req.usuario._id,
      remitenteNombre: req.usuario.nombre,
      remitenteRol: req.usuario.rol,
      mensaje: mensaje || "",
      tipo: mediaUrl ? "media" : "texto",
      mediaUrl: mediaUrl || "",
      leidoPor: [req.usuario._id]
    });

    conversacion.ultimoMensaje = mensaje || (mediaUrl ? "[Adjunto]" : "");
    conversacion.actualizadoEn = new Date();
    await conversacion.save();

    // Notificar a los otros participantes
    conversacion.participantes.forEach((p) => {
      if (p.usuario.toString() !== req.usuario._id.toString()) {
        crearNotificacionMensaje({ destinatarioId: p.usuario, remitenteNombre: req.usuario.nombre, destinatarioRol: p.rol });
      }
    });

    res.status(201).json(nuevo.toJSON());
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
