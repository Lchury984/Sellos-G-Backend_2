import express from "express";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  listarEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  generarReporteVentas,
  generarReporteUsuarios,
  exportarReporteCSV,
  updateAdminProfile,
} from "../controllers/adminController.js";

import { protegerRuta, soloAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ADMINISTRADORES
router.get("/", protegerRuta, soloAdmin, getAdmins);
router.post("/", protegerRuta, soloAdmin, createAdmin);
router.put("/:id", protegerRuta, soloAdmin, updateAdmin);
router.delete("/:id", protegerRuta, soloAdmin, deleteAdmin);
router.post("/login", loginAdmin);
router.patch("/me", protegerRuta, soloAdmin, updateAdminProfile);

// GESTIÓN DE EMPLEADOS
router.get("/empleados", protegerRuta, soloAdmin, listarEmpleados);
router.post("/empleados", protegerRuta, soloAdmin, crearEmpleado);
router.put("/empleados/:id", protegerRuta, soloAdmin, actualizarEmpleado);
router.delete("/empleados/:id", protegerRuta, soloAdmin, eliminarEmpleado);

// REPORTES
router.get("/reportes/ventas", protegerRuta, soloAdmin, generarReporteVentas);
router.get("/reportes/usuarios", protegerRuta, soloAdmin, generarReporteUsuarios);
router.get("/reportes/exportar/csv", protegerRuta, soloAdmin, exportarReporteCSV);

export default router;