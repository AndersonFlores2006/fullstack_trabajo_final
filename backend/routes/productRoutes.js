import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

const router = Router();

// Define product routes
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct); // Use PUT for full update
// Alternatively, use PATCH for partial updates: router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router; 