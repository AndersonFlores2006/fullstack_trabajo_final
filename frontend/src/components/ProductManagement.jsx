import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import Swal from 'sweetalert2'; // Import SweetAlert2

const API_URL = 'http://localhost:5000/api';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null for adding, product object for editing

    // Use useCallback to memoize fetchProducts function
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/products`);
            // Ensure data is array and parse price/stock to numbers here
            if (Array.isArray(response.data)) {
                 const parsedProducts = response.data.map(p => ({
                    ...p,
                    price: parseFloat(p.price) || 0,
                    stock: parseInt(p.stock, 10) || 0
                 }));
                 setProducts(parsedProducts);
            } else {
                 console.error("Invalid data format for products:", response.data);
                 setProducts([]);
                 setError('Formato de datos inválido para productos.');
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError('Error al cargar productos. Intente de nuevo más tarde.');
            setProducts([]); // Clear products on error
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array as it doesn't depend on props/state

    // Fetch products on initial mount
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleShowAddForm = () => {
        setEditingProduct(null); // Ensure we are in add mode
        setShowForm(true);
    };

    const handleShowEditForm = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingProduct(null); // Clear editing state
    };

    const handleFormSubmit = (/* submittedProduct */) => {
        // Refresh the product list after add/edit
        fetchProducts();
        setShowForm(false); // Hide form after successful submission
        setEditingProduct(null);
        // Could also update the state locally for faster UI update:
        // if (editingProduct) {
        //     setProducts(products.map(p => p.id === submittedProduct.id ? submittedProduct : p));
        // } else {
        //     setProducts([...products, submittedProduct]);
        // }
    };

    const handleDeleteProduct = async (productId) => {
        // Use SweetAlert2 for confirmation
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => { // Mark inner function as async
            if (result.isConfirmed) {
                try {
                    setLoading(true); // Optional: show loading indicator during delete
                    setError(null);
                    await axios.delete(`${API_URL}/products/${productId}`);
                    fetchProducts(); // Refresh list after delete
                    Swal.fire(
                        '¡Eliminado!',
                        'El producto ha sido eliminado.',
                        'success'
                    );
                } catch (err) {
                    console.error("Error al eliminar producto:", err); // Translate console log
                    const errorMsg = err.response?.data?.message || 'Error al eliminar el producto.';
                    setError(errorMsg);
                    Swal.fire(
                        'Error',
                        errorMsg, // Show specific error from backend if available
                        'error'
                     );
                } finally {
                     setLoading(false); // Hide loading indicator
                }
            }
        });
    };

    return (
        <div className="card">
            <div className="product-header">
                <h2>Gestión de Productos</h2>
                {!showForm && (
                    <button onClick={handleShowAddForm} className="add-product-button">
                        + Añadir Nuevo Producto
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm ? (
                <ProductForm
                    productToEdit={editingProduct}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                />
            ) : (
                <>
                    {loading ? (
                        <div className="loading">Cargando productos...</div>
                    ) : products.length === 0 ? (
                        <p>No se encontraron productos.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th className="name-column">Nombre / Descripción</th>
                                    <th className="price-column">Precio</th>
                                    <th className="stock-column">Stock</th>
                                    <th className="actions-column">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div>{product.name}</div>
                                            {product.description && (
                                                <div className="product-description">{product.description}</div>
                                            )}
                                        </td>
                                        <td className="price-column">S/.{product.price.toFixed(2)}</td>
                                        <td className="stock-column">{product.stock}</td>
                                        <td>
                                            <div className="product-actions">
                                                <button
                                                    onClick={() => handleShowEditForm(product)}
                                                    className="edit-button"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="delete-button"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductManagement; 