import React from 'react';
import './CustomerList.css'; // Import CSS

// Basic styling removed - moved to CSS
// const listStyle = { listStyle: 'none', padding: 0 };
// const customerItemStyle = { borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
// const buttonStyle = { marginLeft: '10px', padding: '2px 6px', cursor: 'pointer' };

function CustomerList({ customers, onEdit, onDelete }) {
    return (
        <div className="customer-list-container">
            <h3>Lista de Clientes</h3>
            {customers.length === 0 ? (
                <p>No se encontraron clientes.</p>
            ) : (
                <ul className="customer-list">
                    {customers.map(customer => (
                        <li key={customer.id} className="customer-item">
                            <div className="customer-info">
                                <strong>{customer.name}</strong>
                                {customer.email && <span className="customer-email">({customer.email})</span>}
                                <br />
                                <span className="customer-details">
                                    Teléfono: {customer.phone || 'N/A'} | Dirección: {customer.address || 'N/A'}
                                </span>
                            </div>
                            <div className="customer-actions">
                                <button onClick={() => onEdit(customer)} className="button-edit">Editar</button>
                                <button onClick={() => onDelete(customer.id)} className="button-delete">Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CustomerList; 