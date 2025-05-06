import { pool } from '../db/database.js';

// Get all sales with their items and customer name
export const getSales = async (req, res) => {
    console.log('[LOG] GET /api/sales received'); // Log entry point
    try {
        console.log('[LOG] Fetching sales from database...');
        const query = `
            SELECT
                s.id AS sale_id,
                s.sale_date,
                s.total_amount,
                s.customer_id,
                c.name AS customer_name,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'sale_item_id', si.id,
                            'product_id', si.product_id,
                            'product_name', p.name,
                            'quantity', si.quantity,
                            'unit_price', si.unit_price,
                            'subtotal', si.subtotal
                        )
                    )
                    FROM sale_items si
                    JOIN products p ON si.product_id = p.id
                    WHERE si.sale_id = s.id
                ) AS items
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            ORDER BY s.sale_date DESC;
        `;
        const [sales] = await pool.query(query);
        console.log(`[LOG] Found ${sales.length} sales.`);
        res.json(sales);
    } catch (error) {
        console.error("[ERROR] Error fetching sales:", error); // Log error details
        res.status(500).json({ message: 'Error fetching sales' });
    }
};

// Create a new sale (using transaction)
export const createSale = async (req, res) => {
    console.log('[LOG] POST /api/sales received with body:', req.body); // Log entry and body
    const connection = await pool.getConnection();
    console.log('[LOG] Database connection obtained for transaction.');
    try {
        const { customer_id, items } = req.body;

        // --- Input Validation ---
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('[VALIDATION FAIL] No items provided.');
            return res.status(400).json({ message: 'Sale must include at least one item.' });
        }
        for (const item of items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                 console.log('[VALIDATION FAIL] Invalid item data:', item);
                return res.status(400).json({ message: 'Invalid item data. Each item requires product_id and positive quantity.' });
            }
        }
        if (customer_id) {
            const [customerExists] = await connection.query('SELECT 1 FROM customers WHERE id = ?', [customer_id]);
            if (customerExists.length === 0) {
                 console.log(`[VALIDATION FAIL] Customer ID ${customer_id} not found.`);
                return res.status(400).json({ message: `Customer with ID ${customer_id} not found.` });
            }
        }

        console.log('[LOG] Starting transaction...');
        await connection.beginTransaction();

        // --- Check Stock and Calculate Totals ---
        let calculatedTotalAmount = 0;
        const itemDetails = [];
        console.log('[LOG] Checking stock and calculating totals...');
        for (const item of items) {
            const [productRows] = await connection.query('SELECT name, price, stock FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
            if (productRows.length === 0) throw new Error(`Product with ID ${item.product_id} not found.`);
            const product = productRows[0];
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
            const unit_price = product.price;
            const subtotal = unit_price * item.quantity;
            calculatedTotalAmount += subtotal;
            itemDetails.push({ ...item, unit_price, subtotal, current_stock: product.stock });
        }
        console.log('[LOG] Stock check complete. Calculated total:', calculatedTotalAmount);

        // --- Create Sale Record ---
        console.log('[LOG] Inserting sale record...');
        const [saleResult] = await connection.query(
            'INSERT INTO sales (total_amount, customer_id) VALUES (?, ?)',
            [calculatedTotalAmount, customer_id || null]
        );
        const saleId = saleResult.insertId;
        console.log(`[LOG] Sale record created with ID: ${saleId}`);

        // --- Create Sale Items and Update Stock ---
        console.log('[LOG] Inserting sale items and updating stock...');
        for (const detail of itemDetails) {
            await connection.query(
                'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [saleId, detail.product_id, detail.quantity, detail.unit_price, detail.subtotal]
            );
            const newStock = detail.current_stock - detail.quantity;
            await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, detail.product_id]);
        }
        console.log('[LOG] Sale items inserted and stock updated.');

        console.log('[LOG] Committing transaction...');
        await connection.commit();

        // --- Respond with Success ---
        console.log('[LOG] Fetching created sale details for response...');
        const [newSale] = await pool.query(`
             SELECT s.*, c.name as customer_name
             FROM sales s
             LEFT JOIN customers c ON s.customer_id = c.id
             WHERE s.id = ?
        `, [saleId]);

        console.log('[LOG] Transaction successful. Sending response.');
        res.status(201).json({
             message: 'Sale created successfully',
             sale: newSale[0]
         });

    } catch (error) {
        console.error("[ERROR] Error creating sale inside transaction:", error); // Log error
        console.log('[LOG] Rolling back transaction...');
        await connection.rollback();
        if (error.message.startsWith('Insufficient stock') || error.message.includes('not found')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error creating sale' });
        }
    } finally {
        console.log('[LOG] Releasing database connection.');
        connection.release();
    }
}; 