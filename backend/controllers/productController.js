import { pool } from '../db/database.js';

// Get all products
export const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE active = TRUE'); // Solo productos activos
        res.json(rows);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        // Basic validation (can be expanded)
        if (!name || !price || stock === undefined) {
             return res.status(400).json({ message: 'Missing required fields: name, price, stock' });
        }
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description, price, stock]
        );
        res.status(201).json({ id: result.insertId, name, description, price, stock });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Update an existing product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;

        // Check if product exists before updating
        const [checkResult] = await pool.query('SELECT 1 FROM products WHERE id = ?', [id]);
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Construct update query dynamically based on provided fields
        const fieldsToUpdate = {};
        if (name !== undefined) fieldsToUpdate.name = name;
        if (description !== undefined) fieldsToUpdate.description = description;
        if (price !== undefined) fieldsToUpdate.price = price;
        if (stock !== undefined) fieldsToUpdate.stock = stock;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        const [result] = await pool.query('UPDATE products SET ? WHERE id = ?', [fieldsToUpdate, id]);

        if (result.affectedRows === 0) {
            // Should not happen due to the check above, but good practice
            return res.status(404).json({ message: 'Product not found' });
        }

        // Fetch the updated product to return it
        const [updatedRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        res.json(updatedRows[0]);

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Delete a product (soft delete)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el producto existe y está activo
        const [checkResult] = await pool.query('SELECT 1 FROM products WHERE id = ? AND active = TRUE', [id]);
        if (checkResult.length === 0) {
            return res.status(404).json({ message: 'Product not found or already deleted' });
        }

        // Realizar soft delete
        const [result] = await pool.query('UPDATE products SET active = FALSE WHERE id = ?', [id]);
        
        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.sendStatus(204); // No content on successful deletion
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: 'Error deleting product' });
    }
}; 