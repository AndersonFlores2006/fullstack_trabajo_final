-- Desactivar modo seguro de actualizaciones
SET SQL_SAFE_UPDATES = 0;

-- Actualizar categorías de productos existentes
UPDATE products SET category = 'Analgésicos' WHERE name LIKE '%Aspirina%';
UPDATE products SET category = 'Antihistamínicos' WHERE name LIKE '%Loratadina%';
UPDATE products SET category = 'Gastrointestinales' WHERE name LIKE '%Omeprazol%';
UPDATE products SET category = 'Antidiabéticos' WHERE name LIKE '%Metformina%';
UPDATE products SET category = 'Antihipertensivos' WHERE name LIKE '%Losartán%';
UPDATE products SET category = 'Respiratorios' WHERE name LIKE '%Salbutamol%';
UPDATE products SET category = 'Antiinflamatorios' WHERE name LIKE '%Diclofenaco%';
UPDATE products SET category = 'Antibióticos' WHERE name LIKE '%Amoxicilina%';
UPDATE products SET category = 'Antihistamínicos' WHERE name LIKE '%Cetirizina%';
UPDATE products SET category = 'Antiinflamatorios' WHERE name LIKE '%Ibuprofeno%';

-- Reactivar modo seguro de actualizaciones
SET SQL_SAFE_UPDATES = 1; 