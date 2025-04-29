-- Full Database Schema for Nova Salud
-- Uses CREATE TABLE IF NOT EXISTS to prevent errors on re-runs.

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE, -- Email should be unique
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_id INT NULL, -- Use this for FK relationship
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL -- Added FK constraint
    -- Add other fields as needed, e.g., user_id, payment_method
);

-- 4. Sale Items Table (Junction Table)
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Store price at the time of sale
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- --- Initial Data & Applied Modifications ---

-- Add some initial product data
INSERT INTO products (name, description, price, stock) VALUES
('Paracetamol 500mg', 'Pain reliever and fever reducer', 2.50, 100),
('Ibuprofen 400mg', 'Anti-inflammatory drug', 3.80, 50),
('Amoxicillin 250mg', 'Antibiotic', 15.00, 30)
ON DUPLICATE KEY UPDATE name=name; -- Avoid error if products already exist (optional)

-- Note: The following ALTER statements might fail if run multiple times without checks.
-- Consider running them manually or adding checks if necessary.

-- Link Sales to Customers via Foreign Key (Recommended for better data integrity)
-- Step 1: Add the customer_id column to sales (run only if column doesn't exist)
-- ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INT NULL;

-- Step 2: Add the foreign key constraint (run only if constraint doesn't exist)
-- ALTER TABLE sales ADD CONSTRAINT IF NOT EXISTS fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Step 3: Remove the redundant customer_name column (run only if column exists)
-- ALTER TABLE sales DROP COLUMN IF EXISTS customer_name;

-- IMPORTANT: Applying the FK change (steps 1-3 above) requires code changes!
-- You need to update backend/controllers/saleController.js and frontend/src/components/SaleForm.jsx
-- to work with `customer_id` (selecting a customer) instead of the free-text `customer_name` field. 