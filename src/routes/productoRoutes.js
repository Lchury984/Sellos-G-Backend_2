import express from "express";
import {
  crearProducto,
  obtenerProductos,
  obtenerProductosAgrupados,
  obtenerProductosPorCategoria,
  buscarProductos,
  actualizarProducto,
  eliminarProducto,
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria,
  eliminarCategoria
} from "../controllers/productoController.js";
import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ========== CATEGORÍAS (ADMIN ONLY) ==========
router.get("/categorias", obtenerCategorias); // Público - para llenar selects
router.post("/categorias", protegerRuta, soloAdmin, crearCategoria);
router.put("/categorias/:id", protegerRuta, soloAdmin, actualizarCategoria);
router.delete("/categorias/:id", protegerRuta, soloAdmin, eliminarCategoria);

// ========== PRODUCTOS ==========
// Público
router.get("/", obtenerProductos);
router.get("/agrupados", obtenerProductosAgrupados); // Retorna agrupados por categoría
router.get("/categoria/:categoriaId", obtenerProductosPorCategoria);
router.get("/buscar/:termino", buscarProductos);

// Admin only
router.post("/", protegerRuta, soloAdmin, crearProducto);
router.put("/:id", protegerRuta, soloAdmin, actualizarProducto);
router.delete("/:id", protegerRuta, soloAdmin, eliminarProducto);

export default router;
