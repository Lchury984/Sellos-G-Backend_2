// src/controllers/companyController.js
import CompanySettings from '../models/CompanySettings.js';

// Obtener configuración de la empresa (público)
export const obtenerConfiguracion = async (req, res) => {
  try {
    let config = await CompanySettings.findOne();
    
    // Si no existe, crear una con valores por defecto
    if (!config) {
      config = await CompanySettings.create({});
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Actualizar configuración (solo admin)
export const actualizarConfiguracion = async (req, res) => {
  try {
    const { nombre, descripcion, email, telefono, direccion, logoUrl, tagline } = req.body;
    
    let config = await CompanySettings.findOne();
    
    if (!config) {
      // Crear si no existe
      config = await CompanySettings.create({
        nombre,
        descripcion,
        email,
        telefono,
        direccion,
        logoUrl: logoUrl || '',
        tagline: tagline || 'Sellos y Publicidad desde 2015'
      });
    } else {
      // Actualizar existente
      config.nombre = nombre || config.nombre;
      config.descripcion = descripcion || config.descripcion;
      config.email = email || config.email;
      config.telefono = telefono || config.telefono;
      config.direccion = direccion || config.direccion;
      config.tagline = tagline || config.tagline;
      
      if (logoUrl !== undefined) {
        config.logoUrl = logoUrl;
      }
      
      await config.save();
    }
    
    res.json({ msg: 'Configuración actualizada correctamente', config });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ msg: error.message });
  }
};
