import mongoose from "mongoose";

const participanteSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, required: true },
    rol: { type: String, enum: ["administrador", "empleado", "cliente"], required: true },
    nombre: { type: String, required: true }
  },
  { _id: false }
);

const conversacionSchema = new mongoose.Schema(
  {
    participantes: { type: [participanteSchema], required: true },
    ultimoMensaje: { type: String, default: "" },
    actualizadoEn: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

conversacionSchema.index({ "participantes.usuario": 1 });

conversacionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    // Añadir id derivado a cada participante para el frontend
    if (Array.isArray(ret.participantes)) {
      ret.participantes = ret.participantes.map((p) => ({
        ...p,
        id: p.usuario
      }));
    }
    return ret;
  }
});

export default mongoose.model("Conversacion", conversacionSchema);
