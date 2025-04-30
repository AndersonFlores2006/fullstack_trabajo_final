import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ProductForm({ productToEdit, onFormSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name || '',
                description: productToEdit.description || '',
                price: productToEdit.price?.toString() || '',
                stock: productToEdit.stock?.toString() || ''
            });
        } else {
            setFormData({ name: '', description: '', price: '', stock: '' });
        }
    }, [productToEdit]);

    const handleStandardChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate required fields
        if (!formData.name || formData.price === '' || formData.stock === '') {
            setError('Los campos Nombre, Precio y Stock son obligatorios.');
            return;
        }

        // Validate numeric types before submitting
        const priceNum = parseFloat(formData.price);
        const stockNum = parseInt(formData.stock, 10);

        if (isNaN(priceNum) || priceNum < 0) {
            setError('Por favor, ingrese un precio válido positivo.');
            return;
        }
        if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
            setError('Por favor, ingrese un número entero no negativo para el stock.');
            return;
        }

        setSubmitting(true);
        try {
            let response;
            const dataToSend = {
                name: formData.name,
                description: formData.description || '',
                price: priceNum,
                stock: stockNum
            };

            if (productToEdit) {
                response = await axios.put(`${API_URL}/products/${productToEdit.id}`, dataToSend);
            } else {
                response = await axios.post(`${API_URL}/products`, dataToSend);
            }
            onFormSubmit(response.data);

            if (!productToEdit) {
                setFormData({ name: '', description: '', price: '', stock: '' });
            }
        } catch (err) {
            console.error("Error submitting product:", err);
            setError(err.response?.data?.message || 'Error al guardar el producto. Intente de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <h3>{productToEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label htmlFor="name">Nombre: *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleStandardChange}
                    required
                    disabled={submitting}
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Descripción:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleStandardChange}
                    disabled={submitting}
                    rows={3}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="price">Precio: *</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleStandardChange}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stock">Stock: *</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        step="1"
                        min="0"
                        value={formData.stock}
                        onChange={handleStandardChange}
                        required
                        disabled={submitting}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Guardando...' : (productToEdit ? 'Actualizar Producto' : 'Añadir Producto')}
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

export default ProductForm; 