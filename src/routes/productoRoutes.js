import express from "express";
import {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  buscarProductos,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productoController.js";
import { protegerRuta, soloEmpleado } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas públicas
router.get("/", obtenerProductos);
router.get("/buscar/:termino", buscarProductos);
router.get("/:id", obtenerProducto);

// Rutas privadas (Admin / Empleado)
router.post("/", protegerRuta, soloEmpleado, crearProducto);
router.put("/:id", protegerRuta, soloEmpleado, actualizarProducto);
router.delete("/:id", protegerRuta, soloEmpleado, eliminarProducto);

export default router;
