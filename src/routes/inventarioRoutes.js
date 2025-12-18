import express from "express";
import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";
import {
  obtenerMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
  actualizarStock,
  obtenerBajoStock,
  obtenerReporteInventario
} from "../controllers/inventarioController.js";

const router = express.Router();

router.get("/materiales", protegerRuta, soloAdmin, obtenerMateriales);
router.get("/materiales/bajo-stock", protegerRuta, soloAdmin, obtenerBajoStock);
router.get("/reporte", protegerRuta, soloAdmin, obtenerReporteInventario);
router.get("/materiales/:id", protegerRuta, soloAdmin, obtenerMaterial);
router.post("/materiales", protegerRuta, soloAdmin, crearMaterial);
router.put("/materiales/:id", protegerRuta, soloAdmin, actualizarMaterial);
router.patch("/materiales/:id/stock", protegerRuta, soloAdmin, actualizarStock);
router.delete("/materiales/:id", protegerRuta, soloAdmin, eliminarMaterial);

export default router;
