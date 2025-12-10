import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },
  empleadoAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empleado",
    default: null
  },
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ["pendiente", "en proceso", "completado", "cancelado"],
    default: "pendiente"
  },
  notaEmpleado: {
    type: String,
    default: ""
  },
  fechaEntrega: {
    type: Date,
    default: null
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null
  }
}, { timestamps: true });

pedidoSchema.index({ cliente: 1, estado: 1 });
pedidoSchema.index({ empleadoAsignado: 1, estado: 1 });

export default mongoose.model("Pedido", pedidoSchema);
