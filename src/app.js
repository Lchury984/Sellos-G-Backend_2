import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import adminRoutes from "./routes/adminRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import empleadoRoutes from "./routes/empleadoRoutes.js";
import inventarioRoutes from "./routes/inventarioRoutes.js";
import notificacionRoutes from "./routes/notificacionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";


dotenv.config();
const app = express();

// Configurar CORS para producción
// Lista de orígenes permitidos (referencia) y modo permisivo temporal
const allowedOrigins = [
  'https://sellos-g.vercel.app',
  'https://sellos-g-frontend-k62m.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Modo permisivo para desbloquear CORS rápidamente
app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight
app.options('*', cors({ origin: (_o, cb) => cb(null, true), credentials: true }));

// Aumentar límite para payloads con imágenes en base64 (productos)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos subidos (chat media)
app.use("/uploads", express.static(path.resolve("uploads")));

// Rutas activas
app.use("/api/admins", adminRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/company", companyRoutes);

export default app;
