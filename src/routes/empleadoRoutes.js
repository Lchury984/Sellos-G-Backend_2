import express from "express";
import { crearEmpleado, 
    obtenerEmpleados,
    actualizarEmpleado,
    eliminarEmpleado,
} from "../controllers/empleadoController.js";

import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protegerRuta, soloAdmin, crearEmpleado);
router.get("/", protegerRuta, soloAdmin, obtenerEmpleados);
router.put("/:id", protegerRuta, soloAdmin, actualizarEmpleado);
router.delete("/:id", protegerRuta, soloAdmin, eliminarEmpleado)

export default router;
