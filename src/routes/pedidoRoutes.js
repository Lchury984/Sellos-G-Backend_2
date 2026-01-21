import { protegerRuta, soloAdmin, soloEmpleado, soloCliente } from "../middlewares/authMiddleware.js";
import { 
  crearPedido, 
  obtenerPedidos, 
  obtenerPedidosEmpleado,
  actualizarPedido, 
  actualizarEstadoPedido,
  eliminarPedido,
  obtenerMisPedidos,
  crearPedidoPersonalizado
} from "../controllers/pedidoController.js";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Crear carpeta de uploads/pedidos si no existe
const uploadDir = 'uploads/pedidos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para archivos de pedidos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pedido-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JPG, PNG o PDF'));
    }
  }
});

// Rutas específicas (deben ir primero para evitar conflictos con /:id)
// Cliente - ver sus propios pedidos
router.get("/mis-pedidos", protegerRuta, obtenerMisPedidos);

// Cliente - crear pedido personalizado
router.post("/personalizado", protegerRuta, soloCliente, upload.single('archivo'), crearPedidoPersonalizado);

// Empleado - ver pedidos asignados
router.get("/asignados", protegerRuta, soloEmpleado, obtenerPedidosEmpleado);

// Admin - gestión completa de pedidos (deben ir al final)
router.get("/", protegerRuta, soloAdmin, obtenerPedidos);
router.post("/", protegerRuta, soloAdmin, crearPedido);
router.put("/:id", protegerRuta, soloAdmin, actualizarPedido);
router.patch("/:id/estado", protegerRuta, soloEmpleado, actualizarEstadoPedido);
router.delete("/:id", protegerRuta, soloAdmin, eliminarPedido);

export default router;
