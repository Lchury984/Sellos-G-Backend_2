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
const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Solo se permiten imágenes (jpg, png, webp, gif)"));
    }
    cb(null, true);
  }
});

router.use(protegerRuta);

router.get("/conversaciones", obtenerConversaciones);
router.post("/conversaciones", crearConversacion);
router.get("/conversaciones/:id/mensajes", obtenerMensajes);
router.post("/conversaciones/:id/mensajes", enviarMensaje);

// Subir adjuntos (imágenes/videos)
router.post("/media", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No se recibió archivo" });

  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  const relativePath = `/uploads/chat/${req.file.filename}`;
  const publicUrl = `${baseUrl}${relativePath}`;

  res.status(201).json({
    url: publicUrl,
    path: relativePath,
    filename: req.file.filename,
    mimeType: req.file.mimetype
  });
});

export default router;
