import mongoose from "mongoose";

const unidadesPermitidas = [
  "unidades",
  "láminas",
  "frascos",
  "kilos",
  "metros",
  "litros",
  "cajas"
];

const inventarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    descripcion: {
      type: String,
      default: ""
    },
    cantidad: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    unidad: {
      type: String,
      enum: unidadesPermitidas,
      default: "unidades"
    },
    stockMinimo: {
      type: Number,
      required: true,
      default: 10,
      min: 0
    },
    fechaBajoStock: {
      type: Date,
      default: null
    },
    stockInicial: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

inventarioSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default mongoose.model("Inventario", inventarioSchema);
export { unidadesPermitidas };
