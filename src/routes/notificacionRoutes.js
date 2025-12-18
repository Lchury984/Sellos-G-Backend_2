import express from "express";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import {
  obtenerNotificaciones,
  obtenerNoLeidas,
  marcarLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from "../controllers/notificacionController.js";

const router = express.Router();

router.get("/", protegerRuta, obtenerNotificaciones);
router.get("/no-leidas", protegerRuta, obtenerNoLeidas);
router.patch("/leer-todas", protegerRuta, marcarTodasLeidas);
router.patch("/:id/leer", protegerRuta, marcarLeida);
router.delete("/:id", protegerRuta, eliminarNotificacion);

export default router;
