// src/models/Admin.js (CORREGIDO)

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  cedula: {
    type: String,
    required: true,
    unique: true
  },
  telefono: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  rol: {
    type: String,
    default: 'administrador'
  },
  password: {
    type: String,
    required: true
  }
});

// 🔑 AHORA ESTÁN AQUÍ: Definición del middleware 'pre'
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 AHORA ESTÁN AQUÍ: Definición del método 'compararPassword'
adminSchema.methods.compararPassword = async function (passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

// ❌ ELIMINAMOS la línea 'const Admin = mongoose.model("Admin", adminSchema);' redundante

// 🚀 EXPORTAMOS EL MODELO ÚNICO
export default mongoose.model("Admin", adminSchema);