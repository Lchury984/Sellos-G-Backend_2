// src/routes/companyRoutes.js
import express from 'express';
import { obtenerConfiguracion, actualizarConfiguracion } from '../controllers/companyController.js';
import { protegerRuta, soloAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta pública para obtener configuración (para el landing)
router.get('/configuracion', obtenerConfiguracion);

// Ruta protegida para actualizar (solo admin)
router.put('/configuracion', protegerRuta, soloAdmin, actualizarConfiguracion);

export default router;
