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
// Lista explícita de orígenes permitidos
const allowedOrigins = [
  'https://sellos-g.vercel.app',
  'https://sellos-g-frontend-k62m.vercel.app', // mientras existan redirecciones
  'http://localhost:5173',
  'http://localhost:3000'
];

// CORS estricto usando la lista
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // permitir requests sin origin (curl/health)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
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
app.use("/api/company", companyRoutes);

export default app;
