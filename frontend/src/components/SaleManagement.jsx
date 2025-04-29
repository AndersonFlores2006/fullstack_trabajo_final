import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SaleList from './SaleList';
import SaleForm from './SaleForm';

const API_URL = 'http://localhost:5000/api';

function SaleManagement() {
    console.log("[SaleManagement LOG] Component rendering/re-rendering.");
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSaleForm, setShowSaleForm] = useState(false);

    const fetchSales = useCallback(async () => {
        console.log("[SaleManagement LOG] fetchSales called.");
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/sales`);
            console.log("[SaleManagement LOG] fetchSales response received (raw):", response.data);
            if (Array.isArray(response.data)) {
                // Parse total_amount to number for each sale
                const parsedSales = response.data.map(sale => ({
                    ...sale,
                    total_amount: parseFloat(sale.total_amount) || 0 // Parse here
                    // Also parse item prices/subtotals if they might be strings
                    // items: sale.items?.map(item => ({
                    //     ...item,
                    //     unit_price: parseFloat(item.unit_price) || 0,
                    //     subtotal: parseFloat(item.subtotal) || 0
                    // })) || []
                }));
                console.log("[SaleManagement LOG] Parsed sales data:", parsedSales);
                setSales(parsedSales);
            } else {
                console.error("[SaleManagement ERROR] Formato de datos inválido recibido para ventas:", response.data);
                setSales([]);
                setError('Formato de datos inválido para el historial de ventas.');
            }
        } catch (err) {
            console.error("[SaleManagement ERROR] Error al obtener ventas:", err);
            setError('Error al cargar el historial de ventas.');
            setSales([]);
        } finally {
            console.log("[SaleManagement LOG] fetchSales finished. Setting loading to false.");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log("[SaleManagement LOG] useEffect running fetchSales.");
        fetchSales();
    }, [fetchSales]);

    const handleShowSaleForm = () => {
        console.log("[SaleManagement LOG] handleShowSaleForm called.");
        setShowSaleForm(true);
    };

    const handleCancelSaleForm = () => {
        console.log("[SaleManagement LOG] handleCancelSaleForm called.");
        setShowSaleForm(false);
    };

    const handleSaleSubmit = (submittedSaleData) => {
        console.log('[SaleManagement LOG] handleSaleSubmit called with:', submittedSaleData);
        setShowSaleForm(false);
        fetchSales();
    };

    console.log("[SaleManagement LOG] Determining listContent. State:", { loading, error, salesLength: sales.length, showSaleForm });
    let listContent;
    if (loading) {
        listContent = <p>Cargando historial de ventas...</p>;
    } else if (error) {
        listContent = <p className="error-message">Error: {error}</p>;
    } else {
        console.log("[SaleManagement LOG] Rendering SaleList with sales:", sales);
        listContent = <SaleList sales={sales} />;
    }

    console.log("[SaleManagement LOG] Rendering main div. showSaleForm is:", showSaleForm);
    return (
        <div>
            <h2>Gestión de Ventas</h2>

            {showSaleForm ? (
                <>
                 {console.log("[SaleManagement LOG] Rendering SaleForm.")}
                 <SaleForm
                    onSaleSubmit={handleSaleSubmit}
                    onCancel={handleCancelSaleForm}
                 />
                </>
            ) : (
                <>
                    <button onClick={handleShowSaleForm} className="add-button" style={{ marginBottom: '1rem' }}>
                        Crear Nueva Venta
                    </button>
                     {console.log("[SaleManagement LOG] Rendering listContent container.")}
                    {listContent}
                </>
            )}
        </div>
    );
}

export default SaleManagement; 