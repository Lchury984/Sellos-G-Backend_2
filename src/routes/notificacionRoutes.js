import express from "express";
import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";
import {
  obtenerNotificaciones,
  obtenerNoLeidas,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from "../controllers/notificacionController.js";

const router = express.Router();

router.get("/", protegerRuta, soloAdmin, obtenerNotificaciones);
router.get("/no-leidas", protegerRuta, soloAdmin, obtenerNoLeidas);
router.patch("/leer-todas", protegerRuta, soloAdmin, marcarTodasLeidas);
router.patch("/:id/leer", protegerRuta, soloAdmin, marcarLeida);
router.delete("/:id", protegerRuta, soloAdmin, eliminarNotificacion);

export default router;
