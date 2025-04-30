import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import Swal from 'sweetalert2';

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
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    await axios.delete(`${API_URL}/customers/${customerId}`);
                    fetchCustomers(); // Refresh list
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El cliente ha sido eliminado.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (err) {
                    console.error("Error al eliminar cliente:", err);
                    const errorMsg = err.response?.data?.message || 'Error al eliminar el cliente.';
                    setError(errorMsg);
                    Swal.fire({
                        title: 'Error',
                        text: errorMsg,
                        icon: 'error'
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
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