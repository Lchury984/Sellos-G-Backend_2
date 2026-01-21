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
  // Nuevos campos para pedido personalizado
  tipoPedido: {
    type: String,
    enum: ["productos", "personalizado"], // "productos" = pedido normal con productos, "personalizado" = solicitud de trabajo
    default: "productos"
  },
  tipoTrabajo: {
    type: String,
    enum: ["diseño", "impresion", "sellos", "personalizado", "otro"],
    default: null
  },
  prioridad: {
    type: String,
    enum: ["urgente", "normal", "baja"],
    default: "normal"
  },
  descripcion: {
    type: String,
    default: ""
  },
  archivoReferencia: {
    type: String, // URL o ruta del archivo
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
    default: 0
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
