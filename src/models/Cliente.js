import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // ⬅️ 1. Importar bcrypt

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  // ⬅️ 2. Añadir el campo password
  password: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    default: ""
  },
  direccion: {
    type: String,
    default: ""
  },
  // ⚠️ Opcional: Asegura que el rol esté aquí si el backend no lo añade explícitamente
  rol: {
    type: String,
    default: 'cliente',
  }
}, { timestamps: true });

// ⬅️ 3. Middleware para hashear la contraseña antes de guardar
clienteSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ⬅️ 4. Método para comparar la contraseña (¡La solución al TypeError!)
clienteSchema.methods.compararPassword = async function (passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

export default mongoose.model("Cliente", clienteSchema);