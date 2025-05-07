import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Register({ setIsAuthenticated, setUserRole }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'vendedor',
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        role: formData.role
      };
      if (formData.role === 'cliente') {
        payload.name = formData.name;
        payload.email = formData.email;
        payload.phone = formData.phone;
        payload.address = formData.address;
      }
      const response = await axios.post(`${API_URL}/auth/register`, payload);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        if (setUserRole) {
          const payload = JSON.parse(atob(response.data.token.split('.')[1]));
          setUserRole(payload.role);
        }
        if (formData.role === 'cliente') {
          navigate('/comprar');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Error de registro:', err);
      if (err.response) {
        setError(err.response.data.message || 'Error al registrarse');
      } else if (err.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al registrarse');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Registrarme como:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="vendedor">Vendedor</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          {formData.role === 'cliente' && (
            <>
              <div className="form-group">
                <label htmlFor="name">Nombre completo:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={formData.role === 'cliente'}
                  disabled={loading}
                  placeholder="Ej: Anderson Flores"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={formData.role === 'cliente'}
                  disabled={loading}
                  placeholder="Ej: correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono:</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required={formData.role === 'cliente'}
                  disabled={loading}
                  placeholder="Ej: 987654321"
                  maxLength={9}
                  pattern="\d{9}"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Dirección:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required={formData.role === 'cliente'}
                  disabled={loading}
                  placeholder="Ej: Av. Siempre Viva 123"
                />
              </div>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <div className="register-link">
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 