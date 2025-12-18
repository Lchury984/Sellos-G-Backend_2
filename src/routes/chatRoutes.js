import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protegerRuta } from "../middlewares/authMiddleware.js";
import {
  crearConversacion,
  obtenerConversaciones,
  obtenerMensajes,
  enviarMensaje
} from "../controllers/chatController.js";

const router = express.Router();

// Configuración de multer para adjuntos de chat
const uploadDir = path.resolve("uploads/chat");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

router.use(protegerRuta);

router.get("/conversaciones", obtenerConversaciones);
router.post("/conversaciones", crearConversacion);
router.get("/conversaciones/:id/mensajes", obtenerMensajes);
router.post("/conversaciones/:id/mensajes", enviarMensaje);

// Subir adjuntos (imágenes/videos)
router.post("/media", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No se recibió archivo" });
  const publicUrl = `/uploads/chat/${req.file.filename}`;
  res.status(201).json({ url: publicUrl });
});

export default router;
