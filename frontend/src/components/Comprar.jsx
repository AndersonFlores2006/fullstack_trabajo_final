import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

// Mapeo de nombres a imágenes locales
const imagenesMedicinas = {
  'Paracetamol': '/medicinas/PARACETAMOL.jpg',
  'Aspirina': '/medicinas/aspirina.jpg',
  'Loratadina': '/medicinas/Loratadina-10-mg.png',
  'Omeprazol': '/medicinas/omeprazol-tab5709.jpg',
  'Metformina': '/medicinas/Metformina.jpg',
  'Losartán': '/medicinas/LOSARTAN.jpg',
  'Salbutamol': '/medicinas/SALBUTAMOL.webp',
  'Diclofenaco': '/medicinas/DICLOFENACO.jpg',
  'Amoxicilina': '/medicinas/AMOXICILINA.jpg',
  'Cetirizina': '/medicinas/cetirizina.jpg',
  'Ibuprofeno': '/medicinas/ibuprofeno.jpg'
};

function Comprar() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    if (cart.length === 0) return;
    if (!cardNumber || !cardExpiry || !cardCVV) {
      setError('Por favor, ingresa los datos de la tarjeta.');
      return;
    }
    try {
      const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity }));
      await axios.post(`${API_URL}/sales`, { items });
      setSuccess('¡Compra finalizada con éxito!');
      setCart([]);
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      fetchProducts();
      Swal.fire({
        title: '¡Compra exitosa!',
        text: 'Gracias por tu compra.',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000
      });
      setTimeout(() => {
        navigate('/resumen');
      }, 1500);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al procesar la compra');
      }
    }
  };

  return (
    <div className="comprar-container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', padding: '2rem' }}>
      <div style={{ flex: 2 }}>
        <h2>Catálogo de Productos</h2>
        {loading ? <div>Cargando productos...</div> : error ? <div className="error-message">{error}</div> : (
          <div className="comprar-productos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {products.map(product => {
              let imgSrc = product.image;
              if (!imgSrc) {
                const key = Object.keys(imagenesMedicinas).find(k => product.name.toLowerCase().includes(k.toLowerCase()));
                imgSrc = key ? imagenesMedicinas[key] : undefined;
              }
              return (
                <div key={product.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {imgSrc && (
                    <img src={imgSrc} alt={product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', marginBottom: 8 }} />
                  )}
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{product.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 8 }}>{product.description}</div>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>S/.{Number(product.price).toFixed(2)}</div>
                  <div style={{ marginBottom: 8 }}>Stock: {product.stock}</div>
                  <button onClick={() => addToCart(product)} disabled={product.stock === 0} className="add-product-button">
                    {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 300 }}>
        <h2>Carrito</h2>
        {cart.length === 0 ? <div>Tu carrito está vacío.</div> : (
          <div>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <span style={{ flex: 1 }}>{item.name}</span>
                <input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.quantity}
                  onChange={e => updateQuantity(item.id, Number(e.target.value))}
                  style={{ width: 50 }}
                />
                <span>x S/.{Number(item.price).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
              </div>
            ))}
            <div style={{ marginTop: 16, marginBottom: 8 }}>
              <h4>Pago con Tarjeta</h4>
              <input
                type="text"
                placeholder="Número de tarjeta"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value.replace(/[^0-9]/g, '').slice(0,16))}
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
                disabled={success}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  maxLength={4}
                  onChange={e => setCardExpiry(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  style={{ width: '50%', marginBottom: 8, padding: 6 }}
                  disabled={success}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardCVV}
                  maxLength={3}
                  onChange={e => setCardCVV(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                  style={{ width: '50%', marginBottom: 8, padding: 6 }}
                  disabled={success}
                />
              </div>
            </div>
            <div style={{ fontWeight: 'bold', marginTop: 12 }}>Total: S/.{Number(total).toFixed(2)}</div>
            <button className="action-button" style={{ width: '100%', marginTop: 12 }} onClick={handleCheckout} disabled={cart.length === 0}>Finalizar compra</button>
            {success && <div className="success-message" style={{ color: '#22c55e', marginTop: 8 }}>{success}</div>}
            {error && <div className="error-message" style={{ marginTop: 8 }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comprar; 