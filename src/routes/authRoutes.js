import express from "express";
import {
  login,
  solicitarRecuperacion,
  restablecerContraseña,
  actualizarContraseña,
  verificarEmail,
  sendTestEmail,
  resendVerification,
} from "../controllers/authController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post('/verify-email', verificarEmail);
router.post('/debug/send-test-email', sendTestEmail);
router.post('/resend-verification', resendVerification);
router.post("/forgot-password", solicitarRecuperacion);
router.patch("/reset-password/:token", restablecerContraseña);
router.patch("/actualizar", protegerRuta, actualizarContraseña);

export default router;
