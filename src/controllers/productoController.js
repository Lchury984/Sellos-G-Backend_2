import Producto from "../models/Producto.js";
import Categoria from "../models/Categoria.js";

// ========== CATEGORÍAS ==========

// Crear categoría
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validar que no exista duplicada
    const existe = await Categoria.findOne({ nombre: { $regex: `^${nombre}$`, $options: "i" } });
    if (existe) {
      return res.status(400).json({ msg: "La categoría ya existe" });
    }

    const nuevaCategoria = new Categoria({
      nombre,
      descripcion: descripcion || "",
      creadoPor: req.usuario?.id || null
    });
    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Obtener todas las categorías
export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Actualizar categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findByIdAndUpdate(
      id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );

    if (!categoria) {
      return res.status(404).json({ msg: "Categoría no encontrada" });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Eliminar categoría
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByIdAndDelete(id);
    if (!categoria) {
      return res.status(404).json({ msg: "Categoría no encontrada" });
    }

    // Opcional: eliminar productos asociados
    // await Producto.deleteMany({ categoria: id });

    res.json({ msg: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ========== PRODUCTOS ==========

// Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precioBase, precioActual, estado, imagenUrl, descuento, fechaInicioPromocion, fechaFinPromocion } = req.body;

    // Validar que la categoría exista (solo si se proporciona)
    if (categoria && categoria.trim() !== "") {
      try {
        const catExiste = await Categoria.findById(categoria);
        if (!catExiste) {
          return res.status(400).json({ msg: "Categoría no encontrada" });
        }
      } catch (error) {
        if (error.name === "CastError") {
          return res.status(400).json({ msg: "ID de categoría inválido" });
        }
        throw error;
      }
    }

    // Validar imagen base64
    if (imagenUrl && imagenUrl.length > 5 * 1024 * 1024) {
      return res.status(400).json({ msg: "La imagen no debe exceder 5MB" });
    }

    // Determinar si tiene promoción
    const tienePromocion = descuento && parseFloat(descuento) > 0 && fechaInicioPromocion && fechaFinPromocion;

    console.log("Creando producto con datos:", {
      nombre,
      descuento,
      fechaInicioPromocion,
      fechaFinPromocion,
      tienePromocion
    });

    const nuevoProducto = new Producto({
      nombre,
      descripcion: descripcion || "",
      categoria: categoria || null,
      precioBase: parseFloat(precioBase),
      precioActual: parseFloat(precioActual),
      estado: estado || "disponible",
      imagenUrl: imagenUrl || null,
      tienePromocion: !!tienePromocion,
      descuento: descuento ? parseFloat(descuento) : 0,
      fechaInicioPromocion: fechaInicioPromocion || null,
      fechaFinPromocion: fechaFinPromocion || null,
      creadoPor: req.usuario?.id || null
    });

    await nuevoProducto.save();
    const productoPoblado = await nuevoProducto.populate("categoria");
    res.status(201).json(productoPoblado);
  } catch (error) {
    console.error("Error creando producto:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ msg: "Datos inválidos: " + Object.values(error.errors).map(e => e.message).join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ msg: "Tipo de dato inválido en la solicitud" });
    }
    res.status(500).json({ msg: "Error al guardar el producto" });
  }
};

// Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate("categoria").sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Obtener productos agrupados por categoría
export const obtenerProductosAgrupados = async (req, res) => {
  try {
    const productos = await Producto.find().populate("categoria").sort({ "categoria.nombre": 1, nombre: 1 });

    // Agrupar por categoría
    const agrupados = productos.reduce((acc, producto) => {
      const nombreCategoria = producto.categoria?.nombre || "Sin categoría";
      const idCategoria = producto.categoria?._id || null;

      const grupoExistente = acc.find(g => g.categoria._id?.toString() === idCategoria?.toString());

      if (grupoExistente) {
        grupoExistente.productos.push(producto);
      } else {
        acc.push({
          categoria: { _id: idCategoria, nombre: nombreCategoria },
          productos: [producto]
        });
      }
      return acc;
    }, []);

    res.json(agrupados);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Obtener productos por categoría específica
export const obtenerProductosPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;

    const productos = await Producto.find({ categoria: categoriaId }).populate("categoria");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Actualizar producto
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precioBase, precioActual, estado, imagenUrl, descuento, fechaInicioPromocion, fechaFinPromocion } = req.body;

    // Validar categoría si se proporciona
    if (categoria && categoria.trim() !== "") {
      try {
        const catExiste = await Categoria.findById(categoria);
        if (!catExiste) {
          return res.status(400).json({ msg: "Categoría no encontrada" });
        }
      } catch (error) {
        if (error.name === "CastError") {
          return res.status(400).json({ msg: "ID de categoría inválido" });
        }
        throw error;
      }
    }

    // Determinar si tiene promoción
    const tienePromocion = descuento && parseFloat(descuento) > 0 && fechaInicioPromocion && fechaFinPromocion;

    console.log("Actualizando producto con datos:", {
      nombre,
      descuento,
      fechaInicioPromocion,
      fechaFinPromocion,
      tienePromocion
    });

    const producto = await Producto.findByIdAndUpdate(
      id,
      {
        nombre,
        descripcion: descripcion || "",
        categoria: categoria || null,
        precioBase: parseFloat(precioBase),
        precioActual: parseFloat(precioActual),
        estado: estado || "disponible",
        imagenUrl: imagenUrl || null,
        tienePromocion: !!tienePromocion,
        descuento: descuento ? parseFloat(descuento) : 0,
        fechaInicioPromocion: fechaInicioPromocion || null,
        fechaFinPromocion: fechaFinPromocion || null
      },
      { new: true, runValidators: true }
    ).populate("categoria");

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ msg: "Datos inválidos: " + Object.values(error.errors).map(e => e.message).join(", ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ msg: "Tipo de dato inválido en la solicitud" });
    }
    res.status(500).json({ msg: "Error al actualizar el producto" });
  }
};

// Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Buscar productos por nombre o descripción
export const buscarProductos = async (req, res) => {
  try {
    const { termino } = req.params;

    const productos = await Producto.find({
      $or: [
        { nombre: { $regex: termino, $options: "i" } },
        { descripcion: { $regex: termino, $options: "i" } }
      ]
    }).populate("categoria");

    res.json(productos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
