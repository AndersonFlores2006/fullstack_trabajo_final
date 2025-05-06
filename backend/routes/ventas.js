import express from 'express';
import { getVentas, createVenta, getEstadisticas } from '../controllers/ventaController.js';

const router = express.Router();

// Rutas para ventas
router.get('/', getVentas);
router.post('/', createVenta);
router.get('/estadisticas', getEstadisticas);

export default router; 