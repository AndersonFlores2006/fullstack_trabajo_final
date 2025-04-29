import React from 'react';
import './SaleList.css'; // Import CSS

// Basic styling removed - moved to CSS
// const listStyle = { listStyle: 'none', padding: 0 };
// const saleItemStyle = { border: '1px solid #ccc', margin: '10px 0', padding: '10px' };
// const itemStyle = { marginLeft: '15px', fontSize: '0.9em', color: '#333' };

function SaleList({ sales }) {

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Use Spanish locale formatting
            return new Date(dateString).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        // eslint-disable-next-line no-unused-vars
        } catch (_e) {
            return dateString; // Fallback if date is invalid
        }
    };

    return (
        <div className="sale-list-container">
            <h3>Historial de Ventas</h3>
            {sales.length === 0 ? (
                <p>No hay ventas registradas aún.</p>
            ) : (
                <ul className="sale-list">
                    {sales.map(sale => (
                        <li key={sale.sale_id} className="sale-item">
                            <div className="sale-header">
                                <span><strong>ID Venta:</strong> {sale.sale_id}</span>
                                <span><strong>Fecha:</strong> {formatDate(sale.sale_date)}</span>
                                <span><strong>Cliente:</strong> {sale.customer_name || 'N/A'}</span>
                                <span><strong>Monto Total:</strong> S/.{sale.total_amount?.toFixed(2)}</span>
                            </div>
                            <div className="sale-items-container">
                                <strong>Items:</strong>
                                {sale.items && sale.items.length > 0 ? (
                                    <ul className="sale-items-list">
                                        {sale.items.map(item => (
                                            <li key={item.sale_item_id} className="sale-item-detail">
                                                {item.quantity} x {item.product_name} (@ S/.{item.unit_price?.toFixed(2)} c/u) - Subtotal: S/.{item.subtotal?.toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-items-message">No hay detalles de items disponibles.</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SaleList; 