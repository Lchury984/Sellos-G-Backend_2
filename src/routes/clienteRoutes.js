import express from "express";
import { crearCliente, obtenerClientes } from "../controllers/clienteController.js";
import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", crearCliente); // público
router.get("/", protegerRuta, soloAdmin, obtenerClientes); // solo admin


export default router;
