import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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
        
        // Validación especial para el teléfono
        if (name === 'phone') {
            // Solo permite números y limita a 9 dígitos
            const numericValue = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prevData => ({
                ...prevData,
                [name]: numericValue
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validaciones
        if (!formData.name) {
            setError('El nombre del cliente es obligatorio.');
            return;
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Por favor, ingrese una dirección de correo electrónico válida.');
            return;
        }

        if (formData.phone && formData.phone.length !== 9) {
            setError('El número de teléfono debe tener 9 dígitos.');
            return;
        }

        setSubmitting(true);
        try {
            let response;
            const customerData = {
                name: formData.name,
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
            {error && <div className="error-message">{error}</div>}

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
                    className="form-control"
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
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label htmlFor="phone">Teléfono: (9 dígitos)</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                    className="form-control"
                    placeholder="Ingrese 9 dígitos"
                    maxLength={9}
                    pattern="\d{9}"
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
                    className="form-control"
                />
            </div>

            <div className="form-actions">
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="action-button"
                >
                    {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Cliente' : 'Añadir Cliente')}
                </button>
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        disabled={submitting} 
                        className="cancel-button"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}

export default CustomerForm; 