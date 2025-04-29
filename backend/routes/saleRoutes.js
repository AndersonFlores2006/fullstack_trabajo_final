import { Router } from 'express';
import {
    getSales,
    createSale
} from '../controllers/saleController.js';

const router = Router();

// Define sale routes
router.get('/sales', getSales);
router.post('/sales', createSale);

// TODO: Add routes for getting a single sale, updating (if applicable), deleting (if applicable)

export default router; 