import express from "express";
import {
  login,
  solicitarRecuperacion,
  restablecerContraseña,
  actualizarContraseña,
  verificarEmail,
} from "../controllers/authController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post('/verify-email', verificarEmail);
router.post("/recuperar", solicitarRecuperacion);
router.patch("/restablecer/:token", restablecerContraseña);
router.patch("/actualizar", protegerRuta, actualizarContraseña);

export default router;
