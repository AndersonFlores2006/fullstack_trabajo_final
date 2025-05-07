import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function ResumenCliente() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchMisVentas();
    // eslint-disable-next-line
  }, [location.pathname]);

  const fetchMisVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      // El backend debe devolver solo las ventas del cliente autenticado
      const response = await axios.get(`${API_URL}/sales/mis-ventas`);
      setVentas(response.data);
    } catch (err) {
      setError('Error al cargar tu historial de compras');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Mi Historial de Compras</h2>
      {loading ? <div>Cargando...</div> : error ? <div className="error-message">{error}</div> : (
        ventas.length === 0 ? <div>No tienes compras registradas.</div> : (
          <div>
            {ventas.map(venta => {
              const itemsArr = typeof venta.items === 'string' ? JSON.parse(venta.items) : (venta.items || []);
              return (
                <div key={venta.sale_id || venta.id} className="card mb-2" style={{ marginBottom: 16 }}>
                  <div><b>Fecha:</b> {venta.sale_date || venta.fecha}</div>
                  <div><b>Monto Total:</b> S/.{Number(venta.total_amount || venta.monto_total || 0).toFixed(2)}</div>
                  <div><b>Productos:</b></div>
                  <ul>
                    {itemsArr.map((item, idx) => (
                      <li key={idx}>{item.quantity} x {item.product_name} (@ S/.{item.unit_price} c/u)</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default ResumenCliente; 