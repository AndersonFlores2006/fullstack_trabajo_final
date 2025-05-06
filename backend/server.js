import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js'; // Import product routes
import saleRoutes from './routes/saleRoutes.js'; // Import sale routes
import customerRoutes from './routes/customerRoutes.js'; // Import customer routes
import ventasRoutes from './routes/ventas.js';
import authRoutes from './routes/auth.js';
import auth from './middleware/auth.js';
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
const allowedOrigins = [
  'https://fullstack-frontend-yatp.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parse JSON request bodies

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Nova Salud Backend is running!');
});

// Rutas de autenticación (sin protección)
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api', auth, productRoutes);
app.use('/api', auth, saleRoutes); // Add sale routes
app.use('/api', auth, customerRoutes); // Add customer routes
app.use('/api/ventas', auth, ventasRoutes);

// TODO: Add routes for inventory, sales, customers, etc.

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB.' });
  }
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ message: err.message });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Acceso no permitido' });
  }
  res.status(500).json({ message: 'Error en el servidor' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 