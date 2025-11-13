import { protegerRuta, soloCliente, soloEmpleado } from "../middlewares/authMiddleware.js";

// Cliente crea y ve sus pedidos
router.post("/", protegerRuta, soloCliente, crearPedido);
router.get("/mios", protegerRuta, soloCliente, obtenerPedidos);

// Admin / Empleado gestiona todos los pedidos
router.get("/", protegerRuta, soloEmpleado, obtenerPedidos);
router.get("/filtrar", protegerRuta, soloEmpleado, filtrarPedidos);
router.put("/:id", protegerRuta, soloEmpleado, actualizarPedido);
router.delete("/:id", protegerRuta, soloEmpleado, eliminarPedido);
