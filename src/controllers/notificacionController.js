import Notificacion from "../models/Notificacion.js";

export const obtenerNotificaciones = async (_req, res) => {
  try {
    const notificaciones = await Notificacion.find().sort({ createdAt: -1 });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerNoLeidas = async (_req, res) => {
  try {
    const notificaciones = await Notificacion.find({ leida: false }).sort({ createdAt: -1 });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const marcarLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    notificacion.leida = true;
    await notificacion.save();
    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const marcarTodasLeidas = async (_req, res) => {
  try {
    await Notificacion.updateMany({ leida: false }, { leida: true });
    res.json({ msg: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const eliminarNotificacion = async (req, res) => {
  try {
    const notificacion = await Notificacion.findByIdAndDelete(req.params.id);
    if (!notificacion) return res.status(404).json({ msg: "Notificación no encontrada" });

    res.json({ msg: "Notificación eliminada" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
