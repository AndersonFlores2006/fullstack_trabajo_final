import React from 'react';
import './ProductList.css'; // Import the CSS file

// Receive products and action handlers as props
function ProductList({ products, onEdit, onDelete }) {

    // Button styles moved to CSS

    if (products.length === 0) {
        // Return null or a message within a <tr> if no products, handled by parent
        // Or maybe the parent component ProductManagement should handle this conditionally
        // For now, let's assume the parent handles the "No products found" message
        // and only renders the table structure if products exist.
        // If rendered inside a table, it should be a <tr> with a <td> spanning columns.
        // Let's return null here and let ProductManagement handle the empty state message.
        return null;
    }

    return (
        <tbody className="product-list-body">
            {products.map(product => (
                <tr key={product.id} className="product-row">
                    <td className="product-info">
                        <strong>{product.name}</strong>
                        {product.description && <span className="product-description">({product.description})</span>}
                    </td>
                    <td className="product-price">S/.{product.price.toFixed(2)}</td> {/* Change $ to S/. */}
                    <td className="product-stock">{product.stock}</td>
                    <td className="product-actions">
                        <button onClick={() => onEdit(product)} className="button-edit">Editar</button>
                        <button onClick={() => onDelete(product.id)} className="button-delete">Eliminar</button>
                    </td>
                </tr>
            ))}
        </tbody>
    );
}

export default ProductList; 