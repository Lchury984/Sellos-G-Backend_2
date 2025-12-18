import express from "express";
import { crearEmpleado, 
    obtenerEmpleados,
    actualizarEmpleado,
    eliminarEmpleado,
    actualizarPerfilEmpleado,
} from "../controllers/empleadoController.js";

import { protegerRuta, soloAdmin, soloEmpleado } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protegerRuta, soloAdmin, crearEmpleado);
router.get("/", protegerRuta, soloAdmin, obtenerEmpleados);
router.put("/:id", protegerRuta, soloAdmin, actualizarEmpleado);
router.delete("/:id", protegerRuta, soloAdmin, eliminarEmpleado)

// Ruta para que el empleado actualice su propio perfil
router.patch("/me", protegerRuta, soloEmpleado, actualizarPerfilEmpleado);

export default router;
