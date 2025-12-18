import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema(
  {
    conversacion: { type: mongoose.Schema.Types.ObjectId, ref: "Conversacion", required: true },
    remitente: { type: mongoose.Schema.Types.ObjectId, required: true },
    remitenteNombre: { type: String, required: true },
    remitenteRol: { type: String, enum: ["administrador", "empleado", "cliente"], required: true },
    mensaje: { type: String, default: "" },
    tipo: { type: String, enum: ["texto", "media"], default: "texto" },
    mediaUrl: { type: String, default: "" },
    leidoPor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }]
  },
  { timestamps: true }
);

mensajeSchema.index({ conversacion: 1, createdAt: -1 });

mensajeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.remitenteId = ret.remitente;
    delete ret._id;
    return ret;
  }
});

export default mongoose.model("Mensaje", mensajeSchema);
