import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable'; // Import CreatableSelect

const API_URL = 'http://localhost:5000/api'; // Match with ProductList

function ProductForm({ productToEdit, allProducts = [], onFormSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Format products for react-select
    const productOptions = allProducts.map(p => ({
        value: p.id, // Use id as value for potential future use
        label: p.name,
        // Store the full product data to easily access it on change
        productData: p
    }));

    useEffect(() => {
        if (productToEdit) {
            // Editing mode: Populate form
            setFormData({
                name: productToEdit.name || '',
                description: productToEdit.description || '',
                price: productToEdit.price?.toString() || '',
                stock: productToEdit.stock?.toString() || ''
            });
            setIsEditing(true);
        } else {
            // Adding mode: Reset form
            setFormData({ name: '', description: '', price: '', stock: '' });
            setIsEditing(false);
        }
    }, [productToEdit]);

    // Generic handler for description, price, stock
    const handleStandardChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handler specifically for react-select component (Name field)
    const handleNameSelectChange = (selectedOption, actionMeta) => {
        let nameValue = '';
        let matchedProduct = null;

        if (actionMeta.action === 'select-option') {
            // User selected an existing option from the dropdown
            nameValue = selectedOption ? selectedOption.label : '';
            matchedProduct = selectedOption ? selectedOption.productData : null;
            console.log("[ProductForm LOG] Selected existing product:", nameValue);
        } else if (actionMeta.action === 'create-option') {
            // User typed a new option and pressed Enter/selected the "Create" option
            nameValue = selectedOption ? selectedOption.value : ''; // Creatable uses value for new options
            console.log("[ProductForm LOG] Creating new product option:", nameValue);
             // Check if this "new" name actually matches an existing one (case-insensitive)
             // This handles cases where user types an existing name instead of selecting it
            matchedProduct = allProducts.find(p => p.name.toLowerCase() === nameValue.toLowerCase());
             if (matchedProduct) {
                 console.log("[ProductForm LOG] Typed name matches existing product, autofilling.");
             }

        } else if (actionMeta.action === 'clear') {
             // User cleared the selection
             nameValue = '';
             matchedProduct = null;
             console.log("[ProductForm LOG] Cleared product name selection.");
        }
         // Note: Input changes (typing) are handled by onInputChange below for CreatableSelect


        // Update the name field in formData
        setFormData(prevData => ({
            ...prevData,
            name: nameValue,
            // Pre-fill or clear other fields based on whether a match was found
            description: matchedProduct ? (matchedProduct.description || '') : (actionMeta.action !== 'select-option' && prevData.description) || '', // Keep description if typing new, unless selecting
            price: matchedProduct ? (matchedProduct.price?.toString() || '') : (actionMeta.action !== 'select-option' && prevData.price) || '', // Keep price if typing new, unless selecting
            stock: matchedProduct ? (matchedProduct.stock?.toString() || '') : (actionMeta.action !== 'select-option' && prevData.stock) || '' // Keep stock if typing new, unless selecting
        }));

        if (matchedProduct && (actionMeta.action === 'select-option' || actionMeta.action === 'create-option')) {
             console.log("[ProductForm LOG] Formulario autocompletado con producto:", matchedProduct.name);
        } else if (!matchedProduct && actionMeta.action !== 'create-option' && actionMeta.action !== 'select-option') {
            // Clear fields if selection is cleared or name no longer matches
             console.log("[ProductForm LOG] Clearing fields as name does not match existing product or was cleared.");
             // setFormData(prevData => ({ // Option to fully clear if needed
             //   ...prevData,
             //   description: '',
             //   price: '',
             //   stock: ''
             // }));
        }
    };

     // Handle typing directly into the CreatableSelect input field
     // This is needed if you want real-time updates while typing,
     // but the main logic happens in handleNameSelectChange when an action occurs.
     const handleNameInputChange = (inputValue, actionMeta) => {
         if (actionMeta.action === 'input-change') {
            // Optional: You could try to find a match while typing here if desired,
            // but it might conflict with the selection/creation logic.
            // For now, let's just update the name visually if needed,
            // but rely on handleNameSelectChange for the autofill logic.
            // console.log("[ProductForm LOG] Input changed:", inputValue);
            // Set the name in form data directly ONLY IF not editing? Or always?
            // Let's keep relying on the select/create actions for autofill consistency.
         } else if (actionMeta.action === 'input-blur') {
             // Maybe check for a match on blur if nothing was selected/created?
             // console.log("[ProductForm LOG] Input blurred");
         }
     };


    // handleSubmit remains largely the same, just ensure formData.name is used correctly
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate required fields (name comes from formData)
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
            const productData = {
                name: formData.name, // Use name from state
                description: formData.description || null,
                price: priceNum,
                stock: stockNum
            };

            console.log(`[ProductForm LOG] Enviando ${isEditing ? 'actualización' : 'creación'} con datos:`, productData);

            if (isEditing) {
                // IMPORTANT: When editing, we should probably disable changing the name
                // or handle it very carefully to avoid accidental product merging.
                // For now, we send the name from the state, which might have been edited.
                // Consider disabling the name field in edit mode.
                response = await axios.put(`${API_URL}/products/${productToEdit.id}`, productData);
            } else {
                response = await axios.post(`${API_URL}/products`, productData);
            }
            console.log(`[ProductForm LOG] ${isEditing ? 'Actualización' : 'Creación'} exitosa:`, response.data);
            onFormSubmit(response.data);

            // Reset form only if adding successfully
             if (!isEditing) {
                 // Resetting the form needs to clear react-select too
                 setFormData({ name: '', description: '', price: '', stock: '' });
                 // We might need a way to programmatically clear react-select if setFormData isn't enough
                 // For CreatableSelect, setting formData.name to '' and providing it as `inputValue`
                 // *might* work, or we might need a state variable specifically for the Select value.
                 // Let's refine this if reset doesn't work as expected.
             }
        } catch (err) {
            console.error("Error submitting product:", err);
            setError(err.response?.data?.message || 'Error al guardar el producto. Intente de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };


    // Value for the CreatableSelect component
    // It needs to be an object { value: string, label: string } or null
    const selectValue = formData.name ? { value: formData.name, label: formData.name } : null;
     // If editing, find the corresponding option object to pre-populate Select correctly
     const selectValueEditing = isEditing && productToEdit
        ? productOptions.find(option => option.label === productToEdit.name) || { value: productToEdit.name, label: productToEdit.name }
        : selectValue;


    return (
        <form onSubmit={handleSubmit} className="product-form">
            <h3>{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label htmlFor="name">Nombre: *</label>
                {/* Replace input and datalist with CreatableSelect */}
                <CreatableSelect
                    isClearable
                    isDisabled={submitting || isEditing} // Disable editing name for existing products for simplicity
                    isLoading={false} // Set to true if options are loading asynchronously
                    onChange={handleNameSelectChange}
                    onInputChange={handleNameInputChange} // Handle typing
                    options={productOptions}
                    value={selectValueEditing} // Control the selected value
                    placeholder="Escriba o seleccione un producto..."
                    formatCreateLabel={inputValue => `Crear "${inputValue}"`} // Customize "Create" label
                    // If resetting form requires explicit clearing:
                    // inputValue={isEditing ? productToEdit.name : formData.name} // Control input text? Needs testing.
                 />
                 {/* We might need a hidden input if the form relies on a standard 'name' field,
                     but since we handle state directly, it's likely not needed. */}
            </div>
            <div className="form-group">
                <label htmlFor="description">Descripción:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleStandardChange} // Use standard handler
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
                        onChange={handleStandardChange} // Use standard handler
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
                        onChange={handleStandardChange} // Use standard handler
                        required
                        disabled={submitting}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Añadir Producto')}
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