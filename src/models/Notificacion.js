import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    mensaje: {
      type: String,
      required: true,
      trim: true
    },
    tipo: {
      type: String,
      enum: ["mensaje", "pedido", "asignacion", "stock"],
      default: "stock"
    },
    leida: {
      type: Boolean,
      default: false
    },
    data: {
      materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventario" }
    }
  },
  { timestamps: true }
);

notificacionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default mongoose.model("Notificacion", notificacionSchema);
