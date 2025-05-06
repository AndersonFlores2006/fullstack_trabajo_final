-- Selecciona la base de datos (ajusta el nombre si tu base se llama diferente)
USE railway;

-- Insertar medicinas con categoría en la tabla products
INSERT INTO products (name, description, price, stock, category) VALUES
('Aspirina 100mg', 'Analgésico y antipirético', 2.20, 80, 'Analgésicos'),
('Loratadina 10mg', 'Antihistamínico para alergias', 4.50, 60, 'Antihistamínicos'),
('Omeprazol 20mg', 'Protector gástrico', 6.00, 40, 'Gastrointestinales'),
('Metformina 850mg', 'Medicamento para la diabetes', 8.75, 35, 'Antidiabéticos'),
('Losartán 50mg', 'Antihipertensivo', 7.20, 45, 'Antihipertensivos'),
('Salbutamol Inhalador', 'Broncodilatador para asma', 12.00, 25, 'Respiratorios'),
('Diclofenaco 50mg', 'Antiinflamatorio y analgésico', 3.10, 70, 'Antiinflamatorios'),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 18.00, 20, 'Antibióticos'),
('Cetirizina 10mg', 'Antialérgico', 4.00, 55, 'Antihistamínicos'),
('Ibuprofeno 600mg', 'Antiinflamatorio y analgésico', 5.00, 50, 'Antiinflamatorios')
ON DUPLICATE KEY UPDATE 
  description=VALUES(description),
  price=VALUES(price),
  stock=VALUES(stock),
  category=VALUES(category); 
