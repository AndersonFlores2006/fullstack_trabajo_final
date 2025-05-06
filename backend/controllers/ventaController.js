import Venta from '../models/Venta.js';

// Obtener todas las ventas
export const getVentas = async (req, res) => {
    try {
        const ventas = await Venta.find().sort({ fecha: -1 });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear una nueva venta
export const createVenta = async (req, res) => {
    const venta = new Venta({
        monto: req.body.monto,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria
    });

    try {
        const nuevaVenta = await venta.save();
        res.status(201).json(nuevaVenta);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener estadísticas de ventas
export const getEstadisticas = async (req, res) => {
    try {
        const ventas = await Venta.find();
        const totalVentas = ventas.reduce((sum, venta) => sum + venta.monto, 0);
        
        // Agrupar ventas por categoría
        const ventasPorCategoria = ventas.reduce((acc, venta) => {
            acc[venta.categoria] = (acc[venta.categoria] || 0) + venta.monto;
            return acc;
        }, {});

        // Agrupar ventas por mes
        const ventasPorMes = ventas.reduce((acc, venta) => {
            const mes = venta.fecha.getMonth();
            acc[mes] = (acc[mes] || 0) + venta.monto;
            return acc;
        }, {});

        res.json({
            totalVentas,
            ventasPorCategoria,
            ventasPorMes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 