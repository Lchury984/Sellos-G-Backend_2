import express from "express";
import { 
    registrarCliente, 
    obtenerClientes, 
    actualizarCliente,
    eliminarCliente,
} from "../controllers/clienteController.js";
import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 1. Cambiar 'crearCliente' a 'registrarCliente' (para mayor claridad con el flujo de registro)
// 2. Mapear la ruta a "/register" para que coincida con la llamada del frontend.

// Ruta pública para el Registro (POST /api/clientes/register)
// Ruta pública para el Registro (POST /api/clientes/register)
router.post("/register", registrarCliente); 

// Ruta protegida para obtener todos los clientes
router.get("/", protegerRuta, soloAdmin, obtenerClientes); // solo admin

// Rutas CRUD para clientes (solo admin)
router.put("/:id", protegerRuta, soloAdmin, actualizarCliente);
router.delete("/:id", protegerRuta, soloAdmin, eliminarCliente);



export default router;