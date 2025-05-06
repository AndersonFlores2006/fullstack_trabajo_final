
USE railway;
-- Script para agregar la columna 'category' a la tabla products
ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'Sin categoría'; 