import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js'; // Import product routes
import saleRoutes from './routes/saleRoutes.js'; // Import sale routes
import customerRoutes from './routes/customerRoutes.js'; // Import customer routes
import ventasRoutes from './routes/ventas.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Nova Salud Backend is running!');
});

// Use API routes (prefixed with /api)
app.use('/api', productRoutes);
app.use('/api', saleRoutes); // Add sale routes
app.use('/api', customerRoutes); // Add customer routes
app.use('/api/ventas', ventasRoutes);

// TODO: Add routes for inventory, sales, customers, etc.

// Error handling para multer
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB.' });
  }
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 