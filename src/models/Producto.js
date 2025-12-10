import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },
    descripcion: {
      type: String,
      default: ""
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      default: null
    },
    precioBase: {
      type: Number,
      required: [true, "El precio base es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },
    precioActual: {
      type: Number,
      required: [true, "El precio actual es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "El stock no puede ser negativo"]
    },
    estado: {
      type: String,
      enum: ["disponible", "no_disponible"],
      default: "disponible"
    },
    imagenUrl: {
      type: String,
      default: null
    },
    tienePromocion: {
      type: Boolean,
      default: false
    },
    descuento: {
      type: Number,
      default: 0,
      min: [0, "El descuento no puede ser negativo"],
      max: [100, "El descuento no puede ser mayor a 100"]
    },
    fechaInicioPromocion: {
      type: Date,
      default: null
    },
    fechaFinPromocion: {
      type: Date,
      default: null
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Producto", productoSchema);

