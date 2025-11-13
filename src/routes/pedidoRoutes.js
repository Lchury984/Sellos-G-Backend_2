import { protegerRuta, soloCliente, soloEmpleado } from "../middlewares/authMiddleware.js";
import { crearPedido, obtenerPedidos, filtrarPedidos, actualizarPedido, eliminarPedido } from "../controllers/pedidoController.js";
import express from "express";

const router = express.Router();

// Cliente crea y ve sus pedidos
router.post("/", protegerRuta, soloCliente, crearPedido);
router.get("/mios", protegerRuta, soloCliente, obtenerPedidos);

// Admin / Empleado gestiona todos los pedidos
router.get("/", protegerRuta, soloEmpleado, obtenerPedidos);
router.get("/filtrar", protegerRuta, soloEmpleado, filtrarPedidos);
router.put("/:id", protegerRuta, soloEmpleado, actualizarPedido);
router.delete("/:id", protegerRuta, soloEmpleado, eliminarPedido);

export default router;