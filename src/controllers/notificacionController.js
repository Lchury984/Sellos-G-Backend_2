import Notificacion from "../models/Notificacion.js";

export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuario = req.usuario;
    let query = {};
    if (usuario?.rol !== 'administrador') {
      query = { destinatario: usuario._id };
    }
    const notificaciones = await Notificacion.find(query).sort({ createdAt: -1 });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerNoLeidas = async (req, res) => {
  try {
    const usuario = req.usuario;
    let query = { leida: false };
    if (usuario?.rol !== 'administrador') {
      query.destinatario = usuario._id;
    }
    const notificaciones = await Notificacion.find(query).sort({ createdAt: -1 });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const marcarLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    // Permitir solo al dueño o a admin
    if (
      req.usuario.rol !== 'administrador' &&
      notificacion.destinatario?.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    notificacion.leida = true;
    await notificacion.save();
    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const marcarTodasLeidas = async (req, res) => {
  try {
    const usuario = req.usuario;
    const query = usuario?.rol === 'administrador' ? {} : { destinatario: usuario._id };
    await Notificacion.updateMany({ ...query, leida: false }, { leida: true });
    res.json({ msg: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const eliminarNotificacion = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    if (
      req.usuario.rol !== 'administrador' &&
      notificacion.destinatario?.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    await Notificacion.findByIdAndDelete(req.params.id);
    res.json({ msg: "Notificación eliminada" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
