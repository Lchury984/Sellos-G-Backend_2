import { protegerRuta, soloAdmin, soloEmpleado } from "../middlewares/authMiddleware.js";
import { 
  crearPedido, 
  obtenerPedidos, 
  obtenerPedidosEmpleado,
  actualizarPedido, 
  actualizarEstadoPedido,
  eliminarPedido,
  obtenerMisPedidos
} from "../controllers/pedidoController.js";
import express from "express";

const router = express.Router();

// Rutas específicas (deben ir primero para evitar conflictos con /:id)
// Cliente - ver sus propios pedidos
router.get("/mis-pedidos", protegerRuta, obtenerMisPedidos);

// Empleado - ver pedidos asignados
router.get("/asignados", protegerRuta, soloEmpleado, obtenerPedidosEmpleado);

// Admin - gestión completa de pedidos (deben ir al final)
router.get("/", protegerRuta, soloAdmin, obtenerPedidos);
router.post("/", protegerRuta, soloAdmin, crearPedido);
router.put("/:id", protegerRuta, soloAdmin, actualizarPedido);
router.patch("/:id/estado", protegerRuta, soloEmpleado, actualizarEstadoPedido);
router.delete("/:id", protegerRuta, soloAdmin, eliminarPedido);

export default router;
