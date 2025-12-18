// src/models/Empleado.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const empleadoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    edad: {
      type: Number,
    },
    rol: {
      type: String,
      default: "empleado",
    },
    // Campos de verificación de email
    verificado: {
      type: Boolean,
      default: false,
    },
    verificacionToken: {
      type: String,
      default: null,
    },
    verificacionExpira: {
      type: Date,
      default: null,
    },
    // Campos para restablecimiento de contraseña
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpira: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Formato de salida JSON: exponer 'id' y ocultar campos sensibles
empleadoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.verificacionToken;
    delete ret.verificacionExpira;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpira;
    return ret;
  }
});

// Hashear contraseña antes de guardar
empleadoSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Método para comparar contraseña
empleadoSchema.methods.compararPassword = async function (passwordIngresado) {
  return bcrypt.compare(passwordIngresado, this.password);
};

export default mongoose.model("Empleado", empleadoSchema);