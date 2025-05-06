-- Selecciona la base de datos (ajusta el nombre si tu base se llama diferente)
USE railway;

-- Insertar más medicinas aleatorias en la tabla products
INSERT INTO products (name, description, price, stock) VALUES
('Aspirina 100mg', 'Analgésico y antipirético', 2.20, 80),
('Loratadina 10mg', 'Antihistamínico para alergias', 4.50, 60),
('Omeprazol 20mg', 'Protector gástrico', 6.00, 40),
('Metformina 850mg', 'Medicamento para la diabetes', 8.75, 35),
('Losartán 50mg', 'Antihipertensivo', 7.20, 45),
('Salbutamol Inhalador', 'Broncodilatador para asma', 12.00, 25),
('Diclofenaco 50mg', 'Antiinflamatorio y analgésico', 3.10, 70),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 18.00, 20),
('Cetirizina 10mg', 'Antialérgico', 4.00, 55),
('Ibuprofeno 600mg', 'Antiinflamatorio y analgésico', 5.00, 50)
ON DUPLICATE KEY UPDATE name=name; 
