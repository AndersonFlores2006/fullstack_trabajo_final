import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function SaleForm({ onSaleSubmit, onCancel }) {
    const [availableProducts, setAvailableProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Combine error states for simplicity
    const [loadingError, setLoadingError] = useState(null);
    const [formError, setFormError] = useState(null); // For add to cart or submit errors
    const [submitting, setSubmitting] = useState(false);

    // Fetch data
    useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component
        const fetchData = async () => {
            setLoadingError(null);
            console.log("[SaleForm LOG] Obteniendo productos y clientes iniciales...");
            try {
                const [productsResponse, customersResponse] = await Promise.all([
                    axios.get(`${API_URL}/products`),
                    axios.get(`${API_URL}/customers`)
                ]);
                console.log("[SaleForm LOG] Datos iniciales obtenidos:", { products: productsResponse.data.length, customers: customersResponse.data.length });
                if (isMounted) {
                    setAvailableProducts(productsResponse.data.filter(p => p.stock > 0));
                    setCustomers(customersResponse.data);
                }
            } catch (err) {
                console.error("[SaleForm ERROR] Error al obtener datos para el formulario de venta:", err);
                if (isMounted) {
                    setLoadingError('Error al cargar datos iniciales (productos o clientes).');
                }
            }
        };
        fetchData();
        return () => { isMounted = false; }; // Cleanup function
    }, []);

    const handleAddProductToCart = () => {
        console.log("[SaleForm LOG] handleAddProductToCart started.", { selectedProductId, quantity });
        setFormError(null);

        const productIdNum = parseInt(selectedProductId);
        if (!productIdNum || quantity <= 0) {
            console.log("[SaleForm WARN] Validación fallida: No se seleccionó producto o cantidad inválida.");
            setFormError('Por favor, seleccione un producto e ingrese una cantidad válida.');
            return;
        }
        console.log("[SaleForm LOG] Finding product with ID:", productIdNum);
        const productToAdd = availableProducts.find(p => p.id === productIdNum);

        if (!productToAdd) {
            console.log("[SaleForm WARN] Validación fallida: Producto no encontrado en lista disponible.", productIdNum);
            setFormError('Producto seleccionado no encontrado o sin stock.');
            return;
        }
         console.log("[SaleForm LOG] Found product:", productToAdd);

        const requestedQuantity = parseInt(quantity, 10);
        if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
             console.log("[SaleForm WARN] Validación fallida: Cantidad inválida parseada.", quantity);
             setFormError('Cantidad inválida.');
            return;
        }

        if (requestedQuantity > productToAdd.stock) {
             console.log("[SaleForm WARN] Validación fallida: Stock insuficiente.", { needed: requestedQuantity, available: productToAdd.stock });
            setFormError(`Stock insuficiente para ${productToAdd.name}. Solo ${productToAdd.stock} disponibles.`);
            return;
        }

        console.log("[SaleForm LOG] Validation passed. Attempting to update cart...");
        try {
            setCart(currentCart => {
                console.log("[SaleForm LOG] Inside setCart update. Current cart:", currentCart);
                const existingCartItemIndex = currentCart.findIndex(item => item.product_id === productToAdd.id);
                let updatedCart = [...currentCart];
                let hadError = false;

                if (existingCartItemIndex > -1) {
                    console.log("[SaleForm LOG] Product exists in cart. Updating quantity.");
                    const newQuantity = updatedCart[existingCartItemIndex].quantity + requestedQuantity;
                    if (newQuantity > productToAdd.stock) {
                        console.log("[SaleForm WARN] Stock insuficiente al actualizar cantidad en carrito.");
                        setFormError(`Stock insuficiente para ${productToAdd.name}. Solo ${productToAdd.stock} disponibles en total.`);
                        hadError = true;
                        return currentCart;
                    }
                    updatedCart[existingCartItemIndex] = {
                        ...updatedCart[existingCartItemIndex],
                        quantity: newQuantity
                     };
                } else {
                    console.log("[SaleForm LOG] Product not in cart. Adding new item.");
                    updatedCart.push({
                        product_id: productToAdd.id,
                        name: productToAdd.name,
                        quantity: requestedQuantity,
                        price: parseFloat(productToAdd.price) || 0,
                        stock: productToAdd.stock
                    });
                }
                 console.log("[SaleForm LOG] Cart update calculated. Updated cart:", updatedCart);
                 if (!hadError) {
                      // Only reset if cart update didn't hit an error immediately
                      // Resetting state here might be slightly delayed, consider useEffect if needed
                      setSelectedProductId('');
                      setQuantity(1);
                      console.log("[SaleForm LOG] Inputs reset after cart update.");
                 }
                return updatedCart;
            });
             console.log("[SaleForm LOG] setCart llamado.");
        } catch (error) {
            console.error("[SaleForm ERROR] Error durante actualización de setCart:", error);
            setFormError("Ocurrió un error inesperado al actualizar el carrito.");
        }
    };

    const handleRemoveFromCart = (productId) => {
         console.log(`[SaleForm LOG] handleRemoveFromCart called for product ID: ${productId}`);
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const calculateTotal = useCallback(() => {
        const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        // console.log("[SaleForm LOG] calculateTotal executed. Total:", total); // Optional: Can be noisy
        return total;
    }, [cart]);

    const handleSubmitSale = async (e) => {
        e.preventDefault();
         console.log("[SaleForm LOG] handleSubmitSale started.");
        setFormError(null);
        if (cart.length === 0) {
            console.log("[SaleForm WARN] Envío prevenido: Carrito vacío.");
            setFormError('No se puede enviar una venta vacía. Por favor, añada productos.');
            return;
        }
        if (loadingError) {
             console.log("[SaleForm WARN] Envío prevenido: Error de carga de datos iniciales.");
            setFormError('No se puede enviar la venta debido a errores de carga.');
            return;
        }

        setSubmitting(true);
        console.log("[SaleForm LOG] Submitting sale data:", { customer_id: selectedCustomerId || null, items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })) });

        const saleData = {
            customer_id: selectedCustomerId || null,
            items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity }))
        };

        try {
            const response = await axios.post(`${API_URL}/sales`, saleData);
             console.log("[SaleForm LOG] Sale submitted successfully. Response:", response.data);
            onSaleSubmit(response.data);
            // Reset form state fully on success
            setCart([]);
            setSelectedCustomerId('');
            setSelectedProductId('');
            setQuantity(1);
            setFormError(null);
        } catch (err) {
            console.error("[SaleForm ERROR] Error al enviar venta:", err);
            setFormError(err.response?.data?.message || 'Error al enviar la venta. Intente de nuevo.');
        } finally {
             console.log("[SaleForm LOG] Proceso de envío finalizado. Estableciendo submitting a false.");
            setSubmitting(false);
        }
    };

    // Determine if the form is generally disabled due to loading errors
    const isDisabled = !!loadingError;

    // Add log before returning JSX
    console.log("[SaleForm LOG] Rendering SaleForm. State:", { loadingError, formError, cartLength: cart.length, submitting });

    return (
        <form onSubmit={handleSubmitSale} className="sale-form">
            <h3>Crear Nueva Venta</h3>
            {loadingError && <p className="error-message">{loadingError}</p>}
            {formError && <p className="error-message">{formError}</p>}

            {/* Product Selection Section */}
            <div className="form-section product-selection">
                <h4>1. Seleccionar Productos</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="product">Producto:</label>
                        <select
                            id="product"
                            value={selectedProductId}
                            onChange={(e) => { setSelectedProductId(e.target.value); setFormError(null); }}
                            disabled={isDisabled || submitting || availableProducts.length === 0}
                        >
                            <option value="">-- Seleccionar --</option>
                            {availableProducts.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stock: {product.stock}, Precio: S/.{product.price})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group quantity-group">
                        <label htmlFor="quantity">Cantidad:</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                            min="1"
                            disabled={isDisabled || submitting}
                        />
                    </div>
                    <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={handleAddProductToCart}
                        disabled={isDisabled || !selectedProductId || quantity <= 0 || submitting}
                    >
                        Añadir a Venta
                    </button>
                </div>
            </div>

            {/* Cart Display Section */}
            <div className="form-section cart-display">
                <h4>2. Items Actuales en Venta:</h4>
                {cart.length === 0 ? (
                    <p>No hay items añadidos aún.</p>
                ) : (
                    <ul className="cart-list">
                        {cart.map(item => (
                            <li key={item.product_id} className="cart-item">
                                <span>{item.quantity} x {item.name} (@ S/.{item.price.toFixed(2)} c/u)</span>
                                <button
                                    type="button"
                                    className="remove-item-btn"
                                    onClick={() => handleRemoveFromCart(item.product_id)}
                                    disabled={submitting}
                                >
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <p className="cart-total"><strong>Total: S/.{calculateTotal().toFixed(2)}</strong></p>
            </div>

            {/* Customer Selection Section */}
            <div className="form-section customer-selection">
                <h4>3. Seleccionar Cliente (Opcional):</h4>
                <div className="form-group">
                    <select
                        id="customer"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        disabled={isDisabled || submitting || customers.length === 0}
                    >
                        <option value="">-- Ninguno (Venta Anónima) --</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name} ({customer.email || 'Sin Correo'})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Submit/Cancel Buttons Section */}
            <div className="form-actions">
                <button type="submit" disabled={isDisabled || cart.length === 0 || submitting || !!formError}>
                    {submitting ? 'Enviando Venta...' : 'Enviar Venta'}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} disabled={submitting} className="cancel-button">
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}

export default SaleForm; 