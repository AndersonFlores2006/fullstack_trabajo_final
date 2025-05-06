import { pool } from '../db/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw error;
    }
  }

  static async create({ username, password, role = 'user' }) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await pool.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      return { id: result.insertId, username, role };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default User; 