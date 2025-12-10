import Pedido from "../models/Pedido.js";
import Producto from "../models/Producto.js";
import Cliente from "../models/Cliente.js";
import Empleado from "../models/Empleado.js";

// Crear pedido (Admin)
export const crearPedido = async (req, res) => {
  try {
    const { cliente, empleadoAsignado, productos, notaEmpleado } = req.body;

    // Validar cliente
    const clienteExiste = await Cliente.findById(cliente);
    if (!clienteExiste) {
      return res.status(400).json({ msg: "Cliente no encontrado" });
    }

    // Validar empleado si se asigna
    if (empleadoAsignado) {
      const empleadoExiste = await Empleado.findById(empleadoAsignado);
      if (!empleadoExiste) {
        return res.status(400).json({ msg: "Empleado no encontrado" });
      }
    }

    // Calcular subtotales y total
    let total = 0;
    const productosConPrecio = [];

    for (const item of productos) {
      const producto = await Producto.findById(item.producto);
      if (!producto) {
        return res.status(400).json({ msg: `Producto ${item.producto} no encontrado` });
      }

      const precioUnitario = producto.precioActual || producto.precioBase;
      const subtotal = precioUnitario * item.cantidad;
      total += subtotal;

      productosConPrecio.push({
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal
      });
    }

    const nuevoPedido = new Pedido({
      cliente,
      empleadoAsignado: empleadoAsignado || null,
      productos: productosConPrecio,
      total,
      estado: "pendiente",
      notaEmpleado: notaEmpleado || "",
      creadoPor: req.usuario?.id || null
    });

    await nuevoPedido.save();
    
    const pedidoPoblado = await Pedido.findById(nuevoPedido._id)
      .populate("cliente", "nombre correo")
      .populate("empleadoAsignado", "nombre apellido")
      .populate("productos.producto", "nombre precioActual imagenUrl");

    res.status(201).json(pedidoPoblado);
  } catch (error) {
    console.error("Error creando pedido:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Obtener todos los pedidos (Admin)
export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("cliente", "nombre correo telefono")
      .populate("empleadoAsignado", "nombre apellido")
      .populate("productos.producto", "nombre precioActual imagenUrl")
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Obtener pedidos asignados a un empleado
export const obtenerPedidosEmpleado = async (req, res) => {
  try {
    const empleadoId = req.usuario.id; // Del token JWT
    
    const pedidos = await Pedido.find({ empleadoAsignado: empleadoId })
      .populate("cliente", "nombre correo telefono")
      .populate("productos.producto", "nombre precioActual imagenUrl")
      .sort({ createdAt: -1 });
    
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Actualizar pedido completo (Admin)
export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, empleadoAsignado, productos, estado, notaEmpleado } = req.body;

    // Recalcular total si hay productos
    let updateData = { estado, notaEmpleado };

    if (productos && productos.length > 0) {
      let total = 0;
      const productosConPrecio = [];

      for (const item of productos) {
        const producto = await Producto.findById(item.producto);
        if (!producto) {
          return res.status(400).json({ msg: `Producto ${item.producto} no encontrado` });
        }

        const precioUnitario = producto.precioActual || producto.precioBase;
        const subtotal = precioUnitario * item.cantidad;
        total += subtotal;

        productosConPrecio.push({
          producto: item.producto,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal
        });
      }

      updateData.productos = productosConPrecio;
      updateData.total = total;
    }

    if (cliente) updateData.cliente = cliente;
    if (empleadoAsignado !== undefined) updateData.empleadoAsignado = empleadoAsignado;

    const pedido = await Pedido.findByIdAndUpdate(id, updateData, { new: true })
      .populate("cliente", "nombre correo")
      .populate("empleadoAsignado", "nombre apellido")
      .populate("productos.producto", "nombre precioActual imagenUrl");

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Actualizar solo el estado (Empleado)
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const empleadoId = req.usuario.id;

    const pedido = await Pedido.findById(id);
    
    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    // Verificar que el pedido esté asignado a este empleado
    if (pedido.empleadoAsignado?.toString() !== empleadoId) {
      return res.status(403).json({ msg: "No tienes permiso para actualizar este pedido" });
    }

    pedido.estado = estado;
    await pedido.save();

    const pedidoActualizado = await Pedido.findById(id)
      .populate("cliente", "nombre correo")
      .populate("empleadoAsignado", "nombre apellido")
      .populate("productos.producto", "nombre precioActual imagenUrl");

    res.json(pedidoActualizado);
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Eliminar pedido (Admin)
export const eliminarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }
    res.json({ msg: "Pedido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Obtener mis pedidos (Cliente)
export const obtenerMisPedidos = async (req, res) => {
  try {
    const clienteId = req.usuario.id;
    const pedidos = await Pedido.find({ cliente: clienteId })
      .populate("cliente", "nombre correo telefono")
      .populate("empleadoAsignado", "nombre apellido correo telefono")
      .populate("productos.producto")
      .sort({ createdAt: -1 });
    
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos del cliente:", error);
    res.status(500).json({ msg: error.message });
  }
};

