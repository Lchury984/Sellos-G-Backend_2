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


dotenv.config();
const app = express();

// Configurar CORS para producción
const allowedOrigins = [
  'https://sellos-g-frontend-k62m.vercel.app',
  'http://localhost:5173', // para desarrollo local
  'http://localhost:3000'  // alternativa para desarrollo
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

export default app;
