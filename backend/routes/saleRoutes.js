import { Router } from 'express';
import {
    getSales,
    createSale,
    getSalesEstadisticas,
    getMisVentas
} from '../controllers/saleController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Define sale routes
router.get('/sales', getSales);
router.post('/sales', createSale);
router.get('/sales/estadisticas', getSalesEstadisticas);
router.get('/sales/mis-ventas', auth, getMisVentas);

// TODO: Add routes for getting a single sale, updating (if applicable), deleting (if applicable)

export default router; 