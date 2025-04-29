-- Archivo: backend/db/insert_products.sql
-- Script para insertar datos de ejemplo adicionales en la tabla 'products'.

-- Usamos INSERT IGNORE para evitar errores si los productos ya existen.
-- Si prefieres actualizar si existe, considera ON DUPLICATE KEY UPDATE.

INSERT IGNORE INTO products (name, description, price, stock) VALUES
('Paracetamol 500mg', 'Analgésico y antipirético', 2.50, 150),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo (AINE)', 3.80, 120),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 18.50, 80),
('Loratadina 10mg', 'Antihistamínico para alergias', 5.50, 90),
('Omeprazol 20mg', 'Inhibidor de la bomba de protones', 12.75, 70),
('Salbutamol Inhalador 100mcg', 'Broncodilatador para el asma', 25.00, 45),
('Metformina 850mg', 'Antidiabético oral', 8.90, 150),
('Atorvastatina 20mg', 'Reductor de colesterol (estatina)', 35.50, 65),
('Clonazepam 2mg', 'Ansiolítico y anticonvulsivo', 18.00, 50),
('Diclofenaco Sódico 50mg', 'Antiinflamatorio no esteroideo (AINE)', 7.20, 110),
('Diclofenaco Gel 1%', 'Antiinflamatorio tópico para dolor muscular', 9.20, 85),
('Vitamina C 1000mg Efervescente', 'Suplemento vitamínico', 15.60, 100),
('Complejo B Jarabe 120ml', 'Suplemento vitamínico del complejo B', 11.00, 75),
('Ácido Acetilsalicílico 100mg', 'Antiagregante plaquetario, AINE', 3.10, 250),
('Cetirizina 10mg', 'Antihistamínico de segunda generación', 6.80, 95),
('Naproxeno 550mg', 'Antiinflamatorio no esteroideo (AINE)', 9.50, 88),
('Hidroclorotiazida 25mg', 'Diurético tiazídico', 4.20, 130),
('Losartán 50mg', 'Antagonista del receptor de angiotensina II (ARA-II)', 22.00, 77),
('Ranitidina 150mg', 'Antagonista H2 para acidez', 8.10, 40),
('Simvastatina 20mg', 'Reductor de colesterol (estatina)', 30.00, 60),
('Glibenclamida 5mg', 'Antidiabético oral (sulfonilurea)', 6.50, 115),
('Dexametasona 4mg', 'Corticosteroide', 14.80, 55),
('Tramadol 50mg', 'Analgésico opioide', 19.90, 48),
('Ciprofloxacino 500mg', 'Antibiótico (fluoroquinolona)', 28.30, 62),
('Azitromicina 500mg', 'Antibiótico macrólido', 33.10, 70);


SELECT CONCAT('Se intentó insertar ', COUNT(*), ' medicamentos adicionales desde el script.') AS Resultado
FROM (
    SELECT 1 FROM products WHERE name IN (
        'Loratadina 10mg', 'Omeprazol 20mg', 'Salbutamol Inhalador 100mcg', 
        'Metformina 850mg', 'Atorvastatina 20mg', 'Clonazepam 2mg', 
        'Diclofenaco Sódico 50mg', 'Diclofenaco Gel 1%', 'Vitamina C 1000mg Efervescente', 
        'Complejo B Jarabe 120ml', 'Ácido Acetilsalicílico 100mg', 'Cetirizina 10mg', 
        'Naproxeno 550mg', 'Hidroclorotiazida 25mg', 'Losartán 50mg', 
        'Ranitidina 150mg', 'Simvastatina 20mg', 'Glibenclamida 5mg', 
        'Dexametasona 4mg', 'Tramadol 50mg', 'Ciprofloxacino 500mg', 
        'Azitromicina 500mg'
        -- Añade aquí los nombres de los productos que insertaste si quieres un conteo más preciso
    )
) AS sub; -- Añadido alias 'sub' a la tabla derivada
-- También cambié || por CONCAT() para compatibilidad estándar SQL 