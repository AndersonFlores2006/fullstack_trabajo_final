import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SaleList from './SaleList';
import SaleForm from './SaleForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL;

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

    // Exportar a PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text('Historial de Ventas', 14, 16);
            const tableColumn = ['ID Venta', 'Fecha', 'Cliente', 'Monto Total', 'Items'];
            const tableRows = sales.map(sale => {
                const itemsArr = typeof sale.items === 'string' ? JSON.parse(sale.items) : (sale.items || []);
                return [
                    sale.sale_id || sale.id,
                    sale.sale_date || sale.fecha,
                    sale.customer_name || sale.cliente || 'N/A',
                    `S/.${(sale.total_amount || sale.monto_total || 0).toFixed(2)}`,
                    itemsArr.length
                        ? itemsArr.map(item =>
                            `${item.quantity} x ${item.product_name} (@ S/.${item.unit_price} c/u)`
                          ).join('\n')
                        : 'Sin items'
                ];
            });
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 22 });
            doc.save('ventas.pdf');
        } catch (err) {
            alert('Error al generar el PDF. Intenta nuevamente.');
            console.error('Error al exportar PDF:', err);
        }
    };

    // Exportar a Excel
    const exportToExcel = () => {
        const wsData = [
            ['ID Venta', 'Fecha', 'Cliente', 'Monto Total', 'Items'],
            ...sales.map(sale => {
                const itemsArr = typeof sale.items === 'string' ? JSON.parse(sale.items) : (sale.items || []);
                return [
                    sale.sale_id || sale.id,
                    sale.sale_date || sale.fecha,
                    sale.customer_name || sale.cliente || 'N/A',
                    sale.total_amount || sale.monto_total || 0,
                    itemsArr.length
                        ? itemsArr.map(item =>
                            `${item.quantity} x ${item.product_name} (@ S/.${item.unit_price} c/u)`
                          ).join('\n')
                        : 'Sin items'
                ];
            })
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
        XLSX.writeFile(wb, 'ventas.xlsx');
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                        <button onClick={handleShowSaleForm} className="add-button">
                            Crear Nueva Venta
                        </button>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="export-pdf-btn" onClick={exportToPDF}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8.82843C20 8.29799 19.7893 7.78929 19.4142 7.41421L15.5858 3.58579C15.2107 3.21071 14.702 3 14.1716 3H6Z" stroke="#fff" strokeWidth="2"/>
                                        <rect x="8" y="13" width="8" height="2" rx="1" fill="#fff"/>
                                        <rect x="8" y="17" width="5" height="2" rx="1" fill="#fff"/>
                                    </svg>
                                    Exportar a PDF
                                </span>
                            </button>
                            <button className="export-excel-btn" onClick={exportToExcel}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#fff" stroke="#fff" strokeWidth="2"/>
                                        <path d="M7 17L10.5 12L7 7" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M13 7H17" stroke="#34c759" strokeWidth="2" strokeLinecap="round"/>
                                        <path d="M13 12H17" stroke="#34c759" strokeWidth="2" strokeLinecap="round"/>
                                        <path d="M13 17H17" stroke="#34c759" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    Exportar a Excel
                                </span>
                            </button>
                        </div>
                    </div>
                    {console.log("[SaleManagement LOG] Rendering listContent container.")}
                    {listContent}
                </>
            )}
        </div>
    );
}

// Agregar estilos para los botones de exportación
// Puedes mover esto a tu archivo CSS global si prefieres
const style = document.createElement('style');
style.innerHTML = `
.export-pdf-btn {
  background-color: #ef4444;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
}
.export-pdf-btn:hover {
  background-color: #dc2626;
}
.export-excel-btn {
  background-color: #22c55e;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
}
.export-excel-btn:hover {
  background-color: #16a34a;
}
`;
document.head.appendChild(style);

export default SaleManagement; 