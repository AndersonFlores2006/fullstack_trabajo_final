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
        const { items } = req.body;
        // Buscar el customer_id del usuario autenticado
        const userId = req.user.id;
        const [customerRows] = await connection.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (!customerRows.length) {
            return res.status(400).json({ message: 'No se encontró un cliente asociado a este usuario.' });
        }
        const customer_id = customerRows[0].id;

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
        // Validar que el customer_id existe (ya lo hicimos arriba)

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
            [calculatedTotalAmount, customer_id]
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
        if (error && error.stack) {
          console.error(error.stack);
        }
        console.log('[LOG] Rolling back transaction...');
        await connection.rollback();
        if (error.message && (error.message.startsWith('Insufficient stock') || error.message.includes('not found'))) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Error creating sale' });
        }
    } finally {
        console.log('[LOG] Releasing database connection.');
        connection.release();
    }
};

// Obtener estadísticas de ventas reales
export const getSalesEstadisticas = async (req, res) => {
    try {
        // Total de ventas
        const [totalResult] = await pool.query('SELECT SUM(total_amount) as totalVentas FROM sales');
        const totalVentas = totalResult[0].totalVentas || 0;

        // Ventas por mes
        const [mesResult] = await pool.query(`
            SELECT MONTH(sale_date) as mes, SUM(total_amount) as monto
            FROM sales
            GROUP BY mes
            ORDER BY mes
        `);
        const ventasPorMes = {};
        mesResult.forEach(row => {
            ventasPorMes[row.mes - 1] = row.monto; // Meses base 0 para frontend
        });

        // Ventas por categoría (opcional, si existe)
        // Suponiendo que sale_items tiene product_id y products tiene category
        const [catResult] = await pool.query(`
            SELECT p.category as categoria, SUM(si.subtotal) as monto
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            GROUP BY p.category
        `);
        const ventasPorCategoria = {};
        catResult.forEach(row => {
            ventasPorCategoria[row.categoria || 'Sin categoría'] = row.monto;
        });

        res.json({
            totalVentas,
            ventasPorMes,
            ventasPorCategoria
        });
    } catch (error) {
        console.error('[ERROR] Error obteniendo estadísticas de ventas:', error);
        res.status(500).json({ message: 'Error obteniendo estadísticas de ventas' });
    }
};

// Obtener ventas del cliente autenticado
export const getMisVentas = async (req, res) => {
    try {
        // El id del usuario autenticado está en req.user.id
        const userId = req.user.id;
        // Buscar el id del cliente asociado a este usuario
        const [customerRows] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        if (!customerRows.length) {
            return res.json([]); // No es cliente o no tiene compras
        }
        const customerId = customerRows[0].id;
        // Buscar ventas de este cliente
        const query = `
            SELECT
                s.id AS sale_id,
                s.sale_date,
                s.total_amount,
                s.customer_id,
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
            WHERE s.customer_id = ?
            ORDER BY s.sale_date DESC;
        `;
        const [ventas] = await pool.query(query, [customerId]);
        res.json(ventas);
    } catch (error) {
        console.error('[ERROR] Error obteniendo ventas del cliente:', error);
        res.status(500).json({ message: 'Error obteniendo tu historial de compras' });
    }
}; 