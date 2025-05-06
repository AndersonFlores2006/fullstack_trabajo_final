import { pool } from '../db/database.js';

// Get all customers
export const getCustomers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
        if (rows.length <= 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: 'Error fetching customer' });
    }
};

// Create a new customer
export const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Customer name is required.' });
        }
        // Basic email format check (can be improved)
        if (email && !/\S+@\S+\.\S+/.test(email)) {
             return res.status(400).json({ message: 'Invalid email format.' });
        }

        const [result] = await pool.query(
            'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
            [name, email || null, phone || null, address || null]
        );
        res.status(201).json({ id: result.insertId, name, email, phone, address });
    } catch (error) {
        // Handle potential duplicate email error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Email already exists.' }); // 409 Conflict
        }
        console.error("Error creating customer:", error);
        res.status(500).json({ message: 'Error creating customer' });
    }
};

// Update an existing customer
export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;

        // Construct update object dynamically
        const fieldsToUpdate = {};
        if (name !== undefined) fieldsToUpdate.name = name;
        if (email !== undefined) {
            if (email && !/\S+@\S+\.\S+/.test(email)) {
                return res.status(400).json({ message: 'Invalid email format.' });
            }
            fieldsToUpdate.email = email || null;
        }
        if (phone !== undefined) fieldsToUpdate.phone = phone || null;
        if (address !== undefined) fieldsToUpdate.address = address || null;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }
        // Ensure name is not being set to empty if it's part of the update
        if (fieldsToUpdate.name === '') {
             return res.status(400).json({ message: 'Customer name cannot be empty.' });
        }

        const [result] = await pool.query('UPDATE customers SET ? WHERE id = ?', [fieldsToUpdate, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Fetch the updated customer
        const [updatedRows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
        res.json(updatedRows[0]);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists for another customer.' });
        }
        console.error("Error updating customer:", error);
        res.status(500).json({ message: 'Error updating customer' });
    }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Consider implications of deleting a customer if using FK in sales
        // Maybe mark as inactive instead? For now, simple delete.
        const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.sendStatus(204); // No content
    } catch (error) {
        // Handle potential FK constraint errors if customer is linked elsewhere
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: 'Error deleting customer' });
    }
}; 