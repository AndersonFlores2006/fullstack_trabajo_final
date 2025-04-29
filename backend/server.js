import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js'; // Import product routes
import saleRoutes from './routes/saleRoutes.js'; // Import sale routes
import customerRoutes from './routes/customerRoutes.js'; // Import customer routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Nova Salud Backend is running!');
});

// Use API routes (prefixed with /api)
app.use('/api', productRoutes);
app.use('/api', saleRoutes); // Add sale routes
app.use('/api', customerRoutes); // Add customer routes

// TODO: Add routes for inventory, sales, customers, etc.

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 