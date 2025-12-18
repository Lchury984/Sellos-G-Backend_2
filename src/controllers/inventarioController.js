import Inventario from "../models/Inventario.js";
import Notificacion from "../models/Notificacion.js";
import MovimientoInventario from "../models/MovimientoInventario.js";

const registrarMovimiento = async (materialId, cantidadAnterior, cantidadNueva, motivo = "") => {
  try {
    const diferencia = cantidadNueva - cantidadAnterior;
    let tipo = "ajuste";
    if (diferencia > 0) tipo = "entrada";
    if (diferencia < 0) tipo = "salida";

    await MovimientoInventario.create({
      material: materialId,
      cantidadAnterior,
      cantidadNueva,
      diferencia,
      tipo,
      motivo
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
  }
};

const crearNotificacionStock = async (material) => {
  try {
    // Evitar duplicados no leídos para el mismo material
    const existe = await Notificacion.findOne({
      tipo: "stock",
      "data.materialId": material._id,
      leida: false
    });

    if (existe) return;

    await Notificacion.create({
      titulo: `Stock bajo: ${material.nombre}`,
      mensaje: `El material "${material.nombre}" está en ${material.cantidad} ${material.unidad}. Stock mínimo: ${material.stockMinimo}.`,
      tipo: "stock",
      data: { materialId: material._id }
    });
  } catch (error) {
    console.error("Error al generar notificación de stock bajo:", error);
  }
};

const verificarStockBajo = async (material) => {
  const estabaBajo = material.fechaBajoStock !== null && material.fechaBajoStock !== undefined;
  const ahoraBajo = material.cantidad <= material.stockMinimo;

  if (ahoraBajo && !estabaBajo) {
    // Acaba de entrar en bajo stock
    material.fechaBajoStock = new Date();
    await material.save();
    await crearNotificacionStock(material);
  } else if (!ahoraBajo && estabaBajo) {
    // Ya no está en bajo stock
    material.fechaBajoStock = null;
    await material.save();
  } else if (ahoraBajo && estabaBajo) {
    // Sigue en bajo stock, solo notificar
    await crearNotificacionStock(material);
  }
};

export const obtenerMateriales = async (_req, res) => {
  try {
    const materiales = await Inventario.find().sort({ createdAt: -1 });
    res.json(materiales);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerMaterial = async (req, res) => {
  try {
    const material = await Inventario.findById(req.params.id);
    if (!material) return res.status(404).json({ msg: "Material no encontrado" });
    res.json(material);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const crearMaterial = async (req, res) => {
  try {
    const { nombre, descripcion, cantidad, unidad, stockMinimo } = req.body;
    const material = await Inventario.create({
      nombre,
      descripcion,
      cantidad,
      unidad,
      stockMinimo,
      stockInicial: cantidad || 0
    });

    // Registrar movimiento inicial si hay cantidad
    if (cantidad > 0) {
      await registrarMovimiento(material._id, 0, cantidad, "Stock inicial");
    }

    await verificarStockBajo(material);
    res.status(201).json(material);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Ya existe un material con ese nombre" });
    }
    res.status(500).json({ msg: error.message });
  }
};

export const actualizarMaterial = async (req, res) => {
  try {
    const material = await Inventario.findById(req.params.id);
    if (!material) return res.status(404).json({ msg: "Material no encontrado" });

    const cantidadAnterior = material.cantidad;

    material.nombre = req.body.nombre ?? material.nombre;
    material.descripcion = req.body.descripcion ?? material.descripcion;
    if (req.body.cantidad !== undefined) {
      material.cantidad = req.body.cantidad;
      if (cantidadAnterior !== req.body.cantidad) {
        await registrarMovimiento(material._id, cantidadAnterior, req.body.cantidad, "Actualización manual");
      }
    }
    material.unidad = req.body.unidad ?? material.unidad;
    if (req.body.stockMinimo !== undefined) material.stockMinimo = req.body.stockMinimo;

    await material.save();
    await verificarStockBajo(material);

    res.json(material);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const eliminarMaterial = async (req, res) => {
  try {
    const material = await Inventario.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ msg: "Material no encontrado" });
    res.json({ msg: "Material eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const actualizarStock = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const material = await Inventario.findById(req.params.id);
    if (!material) return res.status(404).json({ msg: "Material no encontrado" });

    const cantidadAnterior = material.cantidad;
    material.cantidad = cantidad;
    
    await registrarMovimiento(material._id, cantidadAnterior, cantidad, "Ajuste de stock");
    await material.save();
    await verificarStockBajo(material);

    res.json(material);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerBajoStock = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || null;
    const filtro = threshold
      ? { cantidad: { $lte: threshold } }
      : { $expr: { $lte: ["$cantidad", "$stockMinimo"] } };

    const materiales = await Inventario.find(filtro).sort({ cantidad: 1 });
    res.json(materiales);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const obtenerReporteInventario = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ msg: "Se requieren fechas de inicio y fin" });
    }

    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    // Obtener TODOS los materiales
    const materiales = await Inventario.find();

    // Obtener movimientos en el rango
    const movimientos = await MovimientoInventario.find({
      createdAt: { $gte: inicio, $lte: fin }
    }).populate("material");

    // Agrupar movimientos por material
    const movimientosPorMaterial = {};
    for (const mov of movimientos) {
      if (!mov.material) continue;
      const materialId = mov.material._id.toString();
      
      if (!movimientosPorMaterial[materialId]) {
        movimientosPorMaterial[materialId] = {
          salidas: 0,
          entradas: 0
        };
      }

      if (mov.tipo === "salida") {
        movimientosPorMaterial[materialId].salidas += Math.abs(mov.diferencia);
      } else if (mov.tipo === "entrada") {
        movimientosPorMaterial[materialId].entradas += mov.diferencia;
      }
    }

    // Generar reporte para cada material
    const reporte = materiales.map((material) => {
      const materialId = material._id.toString();
      const movs = movimientosPorMaterial[materialId] || { salidas: 0, entradas: 0 };
      const estaBajo = material.cantidad <= material.stockMinimo;
      
      // Calcular salidas totales: stockInicial - stockActual
      const stockInicial = material.stockInicial || 0;
      const salidasTotales = Math.max(0, stockInicial - material.cantidad);
      
      // Alerta activada si está actualmente en bajo stock
      const alertaActivada = estaBajo;

      return {
        producto: material.nombre,
        salidas: salidasTotales,
        entradas: movs.entradas,
        unidad: material.unidad,
        stockActual: material.cantidad,
        stockMinimo: material.stockMinimo,
        estado: estaBajo ? "Bajo stock" : "Normal",
        alertaActivada: alertaActivada ? "Sí" : "No",
        fechaBajoStock: material.fechaBajoStock,
        stockInicial: stockInicial
      };
    });

    res.json(reporte);
  } catch (error) {
    console.error("Error al generar reporte:", error);
    res.status(500).json({ msg: error.message });
  }
};
