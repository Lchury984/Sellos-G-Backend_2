import mongoose from "mongoose";

const movimientoInventarioSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventario",
      required: true
    },
    cantidadAnterior: {
      type: Number,
      required: true
    },
    cantidadNueva: {
      type: Number,
      required: true
    },
    diferencia: {
      type: Number,
      required: true
    },
    tipo: {
      type: String,
      enum: ["entrada", "salida", "ajuste"],
      required: true
    },
    motivo: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

movimientoInventarioSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default mongoose.model("MovimientoInventario", movimientoInventarioSchema);
