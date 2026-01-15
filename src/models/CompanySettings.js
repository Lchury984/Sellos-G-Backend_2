// src/models/CompanySettings.js
import mongoose from 'mongoose';

const companySettingsSchema = new mongoose.Schema({
  nombre: { type: String, default: 'Sellos-G' },
  descripcion: { 
    type: String, 
    default: 'Especialistas en la creación de sellos únicos y materiales publicitarios de alta calidad. Convierte tus ideas en realidad con diseños profesionales que destacan tu marca.'
  },
  email: { type: String, default: 'info@sellos-g.com' },
  telefono: { type: String, default: '+503 0000-0000' },
  direccion: { type: String, default: 'San Salvador, El Salvador' },
  logoUrl: { type: String, default: '' },
  tagline: { type: String, default: 'Sellos y Publicidad desde 2015' },
  // Solo debe haber un documento de configuración
  _singleton: { type: Boolean, default: true, unique: true }
}, { 
  timestamps: true 
});

// Asegurar que solo exista un documento
companySettingsSchema.pre('save', async function(next) {
  this._singleton = true;
  next();
});

export default mongoose.model('CompanySettings', companySettingsSchema);
