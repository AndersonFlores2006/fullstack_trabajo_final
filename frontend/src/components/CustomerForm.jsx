import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function CustomerForm({ customerToEdit, onFormSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (customerToEdit) {
            setFormData({
                name: customerToEdit.name || '',
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                address: customerToEdit.address || ''
            });
            setIsEditing(true);
        } else {
            setFormData({ name: '', email: '', phone: '', address: '' });
            setIsEditing(false);
        }
    }, [customerToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setError(null); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name) {
            setError('El nombre del cliente es obligatorio.');
            return;
        }
        // Basic email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Por favor, ingrese una dirección de correo electrónico válida.');
            return;
        }

        setSubmitting(true);
        try {
            let response;
            const customerData = {
                name: formData.name,
                // Send email, phone, address only if they have a value, otherwise let backend handle null
                ...(formData.email && { email: formData.email }),
                ...(formData.phone && { phone: formData.phone }),
                ...(formData.address && { address: formData.address }),
            };

            if (isEditing) {
                response = await axios.put(`${API_URL}/customers/${customerToEdit.id}`, customerData);
            } else {
                response = await axios.post(`${API_URL}/customers`, customerData);
            }
            onFormSubmit(response.data);
            if (!isEditing) {
                 setFormData({ name: '', email: '', phone: '', address: '' });
            }
        } catch (err) {
            console.error("Error al enviar cliente:", err);
            setError(err.response?.data?.message || 'Error al guardar el cliente. Intente de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="customer-form">
            <h3>{isEditing ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h3>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label htmlFor="name">Nombre: *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Correo Electrónico:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                />
            </div>
             <div className="form-group">
                <label htmlFor="phone">Teléfono:</label>
                <input
                    type="tel" // Use tel type for phone numbers
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                />
            </div>
             <div className="form-group">
                <label htmlFor="address">Dirección:</label>
                <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    disabled={submitting}
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Cliente' : 'Añadir Cliente')}
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

export default CustomerForm; 