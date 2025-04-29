import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';

const API_URL = 'http://localhost:5000/api';

function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/customers`);
            setCustomers(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener clientes:", err);
            setError('Error al cargar los clientes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleShowAddForm = () => {
        setEditingCustomer(null);
        setShowForm(true);
    };

    const handleShowEditForm = (customer) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingCustomer(null);
    };

    const handleFormSubmit = (/* submittedCustomer */) => {
        fetchCustomers(); // Refresh list
        setShowForm(false);
        setEditingCustomer(null);
    };

    const handleDeleteCustomer = async (customerId) => {
        if (!window.confirm("¿Está seguro que desea eliminar este cliente?")) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/customers/${customerId}`);
            fetchCustomers(); // Refresh list
        } catch (err) {
            console.error("Error al eliminar cliente:", err);
            setError(err.response?.data?.message || 'Error al eliminar el cliente.');
        }
    };

    return (
        <div>
            <h2>Gestión de Clientes</h2>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {showForm ? (
                <CustomerForm
                    customerToEdit={editingCustomer}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                />
            ) : (
                <>
                    <button onClick={handleShowAddForm} className="add-button" style={{ marginBottom: '1rem' }}>
                        Añadir Nuevo Cliente
                    </button>
                    {loading ? (
                        <p>Cargando clientes...</p>
                    ) : (
                        <CustomerList
                            customers={customers}
                            onEdit={handleShowEditForm}
                            onDelete={handleDeleteCustomer}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default CustomerManagement; 