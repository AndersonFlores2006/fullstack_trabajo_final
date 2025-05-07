import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { pool } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, password, role, name, email, phone, address } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario con el rol recibido (cliente o vendedor)
    const user = await User.create({
      username,
      password,
      role: role || 'user'
    });

    // Si el rol es cliente, crear también el registro en customers con los datos extra
    if ((user.role === 'cliente' || user.role === 'customer') && user.id) {
      try {
        await pool.query(
          'INSERT INTO customers (name, email, phone, address, user_id) VALUES (?, ?, ?, ?, ?)',
          [name || username, email || null, phone || null, address || null, user.id]
        );
      } catch (err) {
        console.error('Error creando registro en customers:', err);
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
          // Eliminar el usuario recién creado para evitar inconsistencia
          await pool.query('DELETE FROM users WHERE id = ?', [user.id]);
          return res.status(400).json({ message: 'El correo electrónico ya está registrado como cliente.' });
        }
        // No retornamos error al cliente, pero lo logueamos
      }
    }

    // Generar token con el rol correcto
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 