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
        <div>
            <h2>Gestión de Productos</h2>

            {error && <p className="error-message" style={{ color: 'red' }}>Error: {error}</p>}

            {showForm ? (
                <ProductForm
                    productToEdit={editingProduct}
                    allProducts={products}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                />
            ) : (
                <>
                    <button onClick={handleShowAddForm} className="add-button" style={{ marginBottom: '1rem' }}>
                        Añadir Nuevo Producto
                    </button>

                    {loading ? (
                        <p>Cargando productos...</p>
                    ) : products.length === 0 ? (
                        <p>No se encontraron productos.</p> // Show message when no products and not loading
                    ) : (
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Nombre / Descripción</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <ProductList
                                products={products}
                                onEdit={handleShowEditForm}
                                onDelete={handleDeleteProduct}
                            />
                        </table>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductManagement; 