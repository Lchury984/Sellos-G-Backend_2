import mongoose from "mongoose";

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la categoría es requerido"],
      unique: true,
      trim: true
    },
    descripcion: {
      type: String,
      default: ""
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

export default mongoose.model("Categoria", categoriaSchema);
