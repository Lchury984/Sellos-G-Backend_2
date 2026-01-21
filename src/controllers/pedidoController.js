import Pedido from "../models/Pedido.js";
import Producto from "../models/Producto.js";
import Cliente from "../models/Cliente.js";
import Empleado from "../models/Empleado.js";
import Notificacion from "../models/Notificacion.js";
import Conversacion from "../models/Conversacion.js";
import Mensaje from "../models/Mensaje.js";
import Admin from "../models/Admin.js";

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

    // Crear notificación si se asigna a un empleado
    if (empleadoAsignado) {
      try {
        await Notificacion.create({
          titulo: "Nuevo pedido asignado",
          mensaje: `Se te ha asignado un nuevo pedido del cliente ${clienteExiste.nombre}. Pedido #${nuevoPedido._id.toString().slice(-8).toUpperCase()}`,
          tipo: "asignacion",
          destinatario: empleadoAsignado,
          destinatarioRol: "empleado",
          leida: false,
          data: { pedidoId: nuevoPedido._id }
        });
      } catch (e) {
        console.error("Error al crear notificación de asignación:", e.message);
      }
    }

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

    // Obtener el pedido original para comparar
    const pedidoOriginal = await Pedido.findById(id);
    if (!pedidoOriginal) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

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

    // Crear notificación si se asigna a un empleado (y no estaba asignado antes)
    if (empleadoAsignado && (!pedidoOriginal.empleadoAsignado || pedidoOriginal.empleadoAsignado.toString() !== empleadoAsignado)) {
      try {
        const clienteData = await Cliente.findById(cliente || pedidoOriginal.cliente);
        const nombreCliente = clienteData?.nombre || "Cliente";
        
        await Notificacion.create({
          titulo: "Nuevo pedido asignado",
          mensaje: `Se te ha asignado un nuevo pedido del cliente ${nombreCliente}. Pedido #${id.slice(-8).toUpperCase()}`,
          tipo: "asignacion",
          destinatario: empleadoAsignado,
          destinatarioRol: "empleado",
          leida: false,
          data: { pedidoId: id }
        });
      } catch (e) {
        console.error("Error al crear notificación de asignación:", e.message);
      }
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

    // Crear notificación para el cliente sobre el cambio de estado
    try {
      const Notificacion = (await import('../models/Notificacion.js')).default;
      await Notificacion.create({
        titulo: 'Estado de pedido actualizado',
        mensaje: `Tu pedido ${pedido._id.toString().slice(-8).toUpperCase()} ahora está: ${estado}`,
        tipo: 'pedido',
        destinatario: pedido.cliente,
        destinatarioRol: 'cliente',
        leida: false,
        data: { pedidoId: pedido._id, estado }
      });
    } catch (e) {
      console.error('No se pudo crear notificación de pedido:', e.message);
    }

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

// Crear pedido personalizado (Cliente)
export const crearPedidoPersonalizado = async (req, res) => {
  try {
    const clienteId = req.usuario.id;
    const { tipoTrabajo, prioridad, descripcion } = req.body;

    // Validar campos requeridos
    if (!tipoTrabajo || !prioridad || !descripcion) {
      return res.status(400).json({ msg: "Todos los campos son requeridos" });
    }

    // Obtener archivo si existe
    let archivoReferencia = null;
    if (req.file) {
      // La ruta del archivo subido por multer
      archivoReferencia = `/uploads/pedidos/${req.file.filename}`;
    }

    // Crear el pedido personalizado
    const nuevoPedido = new Pedido({
      cliente: clienteId,
      tipoPedido: "personalizado",
      tipoTrabajo,
      prioridad,
      descripcion,
      archivoReferencia,
      total: 0,
      estado: "pendiente"
    });

    await nuevoPedido.save();

    // Obtener cliente info
    const cliente = await Cliente.findById(clienteId);

    // Buscar todos los administradores
    const admins = await Admin.find();

    if (admins.length === 0) {
      return res.status(500).json({ msg: "No hay administradores disponibles" });
    }

    // Usar el primer administrador para la conversación
    const admin = admins[0];

    // Buscar o crear conversación entre cliente y admin
    let conversacion = await Conversacion.findOne({
      'participantes.usuario': { $all: [clienteId, admin._id] }
    });

    if (!conversacion) {
      conversacion = new Conversacion({
        participantes: [
          { usuario: clienteId, rol: 'cliente', nombre: cliente.nombre },
          { usuario: admin._id, rol: 'administrador', nombre: admin.nombre }
        ],
        ultimoMensaje: '',
        actualizadoEn: new Date()
      });
      await conversacion.save();
    }

    // Crear mensaje con detalles del pedido
    const prioridadEmoji = {
      urgente: "🔴",
      normal: "🟡",
      baja: "🟢"
    };

    let mensajeTexto = `📋 NUEVO PEDIDO PERSONALIZADO\n\n`;
    mensajeTexto += `👤 Cliente: ${cliente.nombre}\n`;
    mensajeTexto += `📦 Tipo de trabajo: ${tipoTrabajo.toUpperCase()}\n`;
    mensajeTexto += `${prioridadEmoji[prioridad]} Prioridad: ${prioridad.toUpperCase()}\n\n`;
    mensajeTexto += `📝 Descripción:\n${descripcion}\n\n`;
    mensajeTexto += `🆔 Pedido #${nuevoPedido._id.toString().slice(-8).toUpperCase()}`;

    const nuevoMensaje = new Mensaje({
      conversacion: conversacion._id,
      remitente: clienteId,
      destinatario: admin._id,
      contenido: mensajeTexto,
      archivo: archivoReferencia ? {
        url: archivoReferencia,
        nombre: req.file.originalname,
        tipo: req.file.mimetype
      } : null,
      leido: false
    });

    await nuevoMensaje.save();

    // Actualizar conversación
    conversacion.ultimoMensaje = mensajeTexto.substring(0, 100);
    conversacion.actualizadoEn = new Date();
    await conversacion.save();

    // Crear notificación para todos los admins
    for (const adminUsuario of admins) {
      try {
        await Notificacion.create({
          titulo: "Nuevo pedido personalizado",
          mensaje: `${cliente.nombre} ha realizado un pedido de ${tipoTrabajo} con prioridad ${prioridad}`,
          tipo: "pedido",
          destinatario: adminUsuario._id,
          destinatarioRol: "administrador",
          leida: false,
          data: { 
            pedidoId: nuevoPedido._id,
            conversacionId: conversacion._id,
            clienteId: clienteId
          }
        });
      } catch (e) {
        console.error(`Error creando notificación para admin ${adminUsuario._id}:`, e.message);
      }
    }

    // Retornar el mensaje creado para que se muestre en el chat
    const mensajePoblado = await Mensaje.findById(nuevoMensaje._id)
      .populate('remitente', 'nombre correo')
      .populate('destinatario', 'nombre correo');

    res.status(201).json({
      msg: "Pedido personalizado creado y enviado al chat del administrador",
      pedido: nuevoPedido,
      mensaje: mensajePoblado,
      conversacionId: conversacion._id
    });
  } catch (error) {
    console.error("Error creando pedido personalizado:", error);
    res.status(500).json({ msg: error.message });
  }
};
