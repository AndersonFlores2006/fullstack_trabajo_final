import { Router } from 'express';
import {
    getSales,
    createSale,
    getSalesEstadisticas
} from '../controllers/saleController.js';

const router = Router();

// Define sale routes
router.get('/sales', getSales);
router.post('/sales', createSale);
router.get('/sales/estadisticas', getSalesEstadisticas);

// TODO: Add routes for getting a single sale, updating (if applicable), deleting (if applicable)

export default router; 