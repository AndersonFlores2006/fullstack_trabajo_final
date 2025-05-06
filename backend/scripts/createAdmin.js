import User from '../models/User.js';
import 'dotenv/config';

async function createAdminUser() {
  try {
    // Verificar si el usuario admin ya existe
    const existingAdmin = await User.findByUsername('admin');
    if (existingAdmin) {
      console.log('El usuario admin ya existe');
      process.exit(0);
    }

    // Crear usuario admin
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Usuario admin creado exitosamente');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser(); 