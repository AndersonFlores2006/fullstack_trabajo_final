import React, { useState, useEffect } from 'react'; // Import hooks for Dashboard
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios for Dashboard
import ProductManagement from './components/ProductManagement';
import SaleManagement from './components/SaleManagement';
import CustomerManagement from './components/CustomerManagement';
import VentasEstadisticas from './components/VentasEstadisticas';
import './App.css';

// Importar las imágenes
import nurseLeft from './assets/nurse-left.png';
import nurseRight from './assets/nurse-left.png'; // Usamos la misma imagen pero la voltearemos con CSS

const API_URL = import.meta.env.VITE_API_URL;

// Basic Nav styling (will be improved in App.css)
// const navStyle = { // Removed - styles moved to App.css
// };
// const linkStyle = { // Removed - styles moved to App.css
// };

function App() {
  return (
    <>
      <img src={nurseLeft} alt="" className="side-image side-image-left" />
      <img src={nurseRight} alt="" className="side-image side-image-right" />
      
      <div className="app-container">
        <header className="App-header">
          <div className="header-content">
            <h1>Botica Nova Salud</h1>
            <nav className="main-nav">
              <Link to="/" className="nav-link">Resumen</Link>
              <Link to="/products" className="nav-link">Productos</Link>
              <Link to="/sales" className="nav-link">Ventas</Link>
              <Link to="/customers" className="nav-link">Clientes</Link>
            </nav>
          </div>
        </header>

        <main className="content-wrapper">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/sales" element={<SaleManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="App-footer">
          <p>&copy; {new Date().getFullYear()} Nova Salud - Sistema de Gestión</p>
        </footer>
      </div>
    </>
  );
}

// Enhanced Dashboard Component
function Dashboard() {
  const [counts, setCounts] = useState({ products: 0, customers: 0, sales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, customersRes, salesRes] = await Promise.allSettled([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/customers`),
          axios.get(`${API_URL}/sales`)
        ]);

        if (isMounted) {
            const productsCount = productsRes.status === 'fulfilled' && Array.isArray(productsRes.value.data) ? productsRes.value.data.length : 0;
            const customersCount = customersRes.status === 'fulfilled' && Array.isArray(customersRes.value.data) ? customersRes.value.data.length : 0;
            const salesCount = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value.data) ? salesRes.value.data.length : 0;

            setCounts({ products: productsCount, customers: customersCount, sales: salesCount });

            if ([productsRes, customersRes, salesRes].some(res => res.status === 'rejected')) {
                console.error("Error fetching some dashboard counts:", { productsRes, customersRes, salesRes });
                setError("Error al cargar algunos datos del resumen.");
            }
        }
      } catch (err) {
        console.error("Unexpected error fetching dashboard counts:", err);
         if (isMounted) {
             setError("Error inesperado al cargar datos del resumen.");
         }
      } finally {
         if (isMounted) {
             setLoading(false);
         }
      }
    };
    fetchCounts();
     return () => { isMounted = false; };
  }, []);

  return (
    <div className="dashboard">
      <h2>Resumen General</h2>
      {loading && <div className="loading">Cargando resumen...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && (
        <>
          <div className="dashboard-summary">
            <div className="summary-card" onClick={() => navigate('/products')}>
              <h3>{counts.products}</h3>
              <p>Productos Totales</p>
            </div>
            <div className="summary-card" onClick={() => navigate('/customers')}>
              <h3>{counts.customers}</h3>
              <p>Clientes Totales</p>
            </div>
            <div className="summary-card" onClick={() => navigate('/sales')}>
              <h3>{counts.sales}</h3>
              <p>Ventas Totales</p>
            </div>
          </div>
          <VentasEstadisticas />
        </>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="card text-center">
      <h2>Página No Encontrada</h2>
      <p>La página que buscas no existe o ha sido movida.</p>
    </div>
  );
}

export default App;
