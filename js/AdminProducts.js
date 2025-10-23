// Admin Products Management JavaScript
// Handles the Products tab in the admin interface

let adminProducts = [];
let adminCategories = [];
let adminSizes = [];
let adminUnits = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadAdminProducts();
    loadAdminCategories();
    loadAdminSizes();
    loadAdminUnits();
    setupAdminEventListeners();
});

// Load products for admin table view
async function loadAdminProducts() {
    try {
        const response = await fetch('db/products_getAll.php');
        const data = await response.json();
        adminProducts = data.products || data;
        renderAdminProducts();
        updateCategoryFilter();
    } catch (error) {
        console.error('Error loading products:', error);
        showAdminToast('Error loading products', 'error');
    }
}

// Load categories for admin
async function loadAdminCategories() {
    try {
        const response = await fetch('db/categories_getAll.php');
        adminCategories = await response.json();
        updateCategoryFilter();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load sizes for admin
async function loadAdminSizes() {
    try {
        const response = await fetch('db/sizes_getAll.php');
        adminSizes = await response.json();
    } catch (error) {
        console.error('Error loading sizes:', error);
    }
}

// Load units for admin
async function loadAdminUnits() {
    try {
        const response = await fetch('db/product_units_get.php');
        adminUnits = await response.json();
    } catch (error) {
        console.error('Error loading units:', error);
    }
}

// Handle dynamic price updates in edit modal
async function updateEditModalPrice(productId, sizeSelect, unitSelect, priceInput) {
    const sizeId = sizeSelect.value;
    const unitId = unitSelect.value;

    if (!sizeId || !unitId) {
        priceInput.value = '';
        return;
    }

    try {
        const response = await fetch(`db/product_prices_get.php?productID=${productId}&sizeID=${sizeId}&unit_id=${unitId}`);
        const data = await response.json();
        priceInput.value = data.price !== null ? data.price : '';
    } catch (error) {
        console.error('Error fetching price for edit modal:', error);
        priceInput.value = '';
    }
}

// Render products in admin table
function renderAdminProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (adminProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
                        No products found
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = adminProducts.map(product => {
        // Restore saved selections from localStorage
        const savedSize = localStorage.getItem(`product_${product.productID}_size`) || '';
        const savedUnit = localStorage.getItem(`product_${product.productID}_unit`) || '';

        // Format created_at to military time
        const formatToMilitaryTime = (dateStr) => {
            if (!dateStr || dateStr === 'N/A') return 'N/A';
            const date = new Date(dateStr);
            if (isNaN(date)) return dateStr;
            return date.toISOString().slice(0, 19).replace('T', ' ');
        };

        return `
            <tr>
                <td>
                    <div class="product-info">
                        <strong>${product.productName}</strong>
                        <small class="text-muted">ID: ${product.productID}</small>
                    </div>
                </td>
                <td>${product.categoryName || 'Unknown'}</td>
                <td>
                    <select class="size-dropdown" data-product-id="${product.productID}" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">Select Size</option>
                        ${adminSizes.map(size => `<option value="${size.sizeID}" ${savedSize == size.sizeID ? 'selected' : ''}>${size.sizeName.replace('oz', '').trim()}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="unit-dropdown" data-product-id="${product.productID}" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">Select Unit</option>
                        ${[...new Map(adminUnits.filter(unit => unit.unit_symbol === 'oz' || unit.unit_symbol === 'pc').map(unit => [unit.unit_symbol, unit])).values()].map(unit => `<option value="${unit.unit_id}" ${savedUnit == unit.unit_id ? 'selected' : ''}>${unit.unit_name} (${unit.unit_symbol})</option>`).join('')}
                    </select>
                </td>
                <td>
                    <div style="position: relative; display: inline-block; width: 100%;">
                        <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #666; font-weight: bold; z-index: 1;">₱</span>
                        <input type="number" class="price-input" data-product-id="${product.productID}" min="0" step="0.01" placeholder="0.00" style="width: 100%; padding: 4px 4px 4px 20px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    </div>
                </td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${formatToMilitaryTime(product.created_at)}</td>
                <td>
                    <button class="btn-small btn-primary" data-product-id="${product.productID}" onclick="editAdminProduct(this.dataset.productId)">
                        <ion-icon name="create-outline"></ion-icon>
                        Edit
                    </button>
                </td>
                <td>
                    <input type="checkbox" class="product-checkbox" data-product-id="${product.productID}" style="text-align: center;">
                </td>
            </tr>
        `;
    }).join('');

    // After rendering, trigger change events for saved selections to fetch prices
    adminProducts.forEach(product => {
        const savedSize = localStorage.getItem(`product_${product.productID}_size`);
        const savedUnit = localStorage.getItem(`product_${product.productID}_unit`);
        if (savedSize && savedUnit) {
            const row = document.querySelector(`[data-product-id="${product.productID}"]`).closest('tr');
            const sizeSelect = row.querySelector('.size-dropdown');
            const unitSelect = row.querySelector('.unit-dropdown');
            // Trigger the change event to fetch price
            handleAdminSizeUnitChange({ target: sizeSelect });
        }
    });
}

// Update category filter dropdown
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        adminCategories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
}

// Setup event listeners
function setupAdminEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterAdminProducts);
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAdminProducts);
    }

    // Price editing event listeners
    document.addEventListener('change', handleAdminPriceChange);
    document.addEventListener('change', handleAdminSizeUnitChange);

    // Checkbox event listeners
    document.addEventListener('change', handleProductCheckboxChange);
}

// Filter products
function filterAdminProducts() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';

    if (!categoryFilter && !searchTerm) {
        renderAdminProducts();
        return;
    }

    let filteredProducts = adminProducts;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.productName.toLowerCase().includes(searchTerm)
        );
    }

    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product =>
            product.categoryID == categoryFilter
        );
    }

    // Temporarily replace products array for rendering
    const originalProducts = adminProducts;
    adminProducts = filteredProducts;
    renderAdminProducts();
    adminProducts = originalProducts;

    // After rendering filtered products, trigger change events for saved selections to fetch prices
    filteredProducts.forEach(product => {
        const savedSize = localStorage.getItem(`product_${product.productID}_size`);
        const savedUnit = localStorage.getItem(`product_${product.productID}_unit`);
        if (savedSize && savedUnit) {
            const row = document.querySelector(`[data-product-id="${product.productID}"]`).closest('tr');
            const sizeSelect = row.querySelector('.size-dropdown');
            const unitSelect = row.querySelector('.unit-dropdown');
            // Trigger the change event to fetch price
            handleAdminSizeUnitChange({ target: sizeSelect });
        }
    });
}

// Add Category Modal
function showAddCategoryModal() {
    if (window.USER_ROLE !== 'admin') {
        showAdminToast('Only administrators can add categories', 'warning');
        return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'addCategoryModal';
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;
    `;
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Add New Category</h3>
                <span class="close" onclick="closeAddCategoryModal()" style="cursor: pointer; font-size: 24px; font-weight: bold;">&times;</span>
            </div>
            <form id="addCategoryForm">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="categoryNameInput">Category Name:</label>
                    <input type="text" id="categoryNameInput" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="closeAddCategoryModal()" class="btn-secondary" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button type="submit" class="btn-primary" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Category</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Handle submit
    document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('categoryNameInput').value.trim();
        if (!name) {
            showAdminToast('Please enter a category name', 'error');
            return;
        }
        closeAddCategoryModal();
        await addAdminCategory(name);
    });
}

function closeAddCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    if (modal) modal.remove();
}

// Add Size Modal
function showAddSizeModal() {
    if (window.USER_ROLE !== 'admin') {
        showAdminToast('Only administrators can add sizes', 'warning');
        return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'addSizeModal';
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;
    `;
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Add New Size</h3>
                <span class="close" onclick="closeAddSizeModal()" style="cursor: pointer; font-size: 24px; font-weight: bold;">&times;</span>
            </div>
            <form id="addSizeForm">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="sizeNameInput">Size Name:</label>
                    <input type="text" id="sizeNameInput" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="sizePriceInput">Default Price (₱):</label>
                    <input type="number" id="sizePriceInput" min="0" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="closeAddSizeModal()" class="btn-secondary" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button type="submit" class="btn-primary" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Size</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Handle submit
    document.getElementById('addSizeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('sizeNameInput').value.trim();
        const price = parseFloat(document.getElementById('sizePriceInput').value);
        if (!name || isNaN(price) || price < 0) {
            showAdminToast('Please enter valid name and price', 'error');
            return;
        }
        closeAddSizeModal();
        await addAdminSize(name, price);
    });
}

function closeAddSizeModal() {
    const modal = document.getElementById('addSizeModal');
    if (modal) modal.remove();
}

async function showAddProductModal() {
    if (window.USER_ROLE !== 'admin') {
        showAdminToast('Only administrators can add products', 'warning');
        return;
    }

    try {
        // Fetch categories and units fresh for the modal
        const [categoriesResponse, unitsResponse] = await Promise.all([
            fetch('db/categories_getAll.php'),
            fetch('db/product_units_get.php')
        ]);
        const categories = await categoriesResponse.json();
        const units = await unitsResponse.json();

        if (categories.length === 0) {
            showAdminToast('No categories available. Please add categories first.', 'warning');
            return;
        }

        // Check if modal already exists
        let modal = document.getElementById('addProductModal');
        if (!modal) {
            // Create modal
            modal = document.createElement('div');
            modal.id = 'addProductModal';
            modal.className = 'modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: none; align-items: center; justify-content: center;
            `;
            modal.innerHTML = `
                <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Add New Product</h3>
                        <span class="close" onclick="closeAddProductModal()" style="cursor: pointer; font-size: 24px; font-weight: bold;">&times;</span>
                    </div>
                    <form id="addProductForm">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="productNameInput">Product Name:</label>
                            <input type="text" id="productNameInput" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="productCategorySelect">Category:</label>
                            <select id="productCategorySelect" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="">Select Category</option>
                                ${categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-row" style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <div class="form-group" style="flex: 1;">
                                <label for="productSizeInput">Size (optional):</label>
                                <input type="text" id="productSizeInput" placeholder="e.g., Medium" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label for="productUnitSelect">Unit:</label>
                                <select id="productUnitSelect" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="">Select Unit</option>
                                    ${units.map(unit => `<option value="${unit.unit_id}">${unit.unit_name} (${unit.unit_symbol})</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="productPriceInput">Price (optional):</label>
                            <input type="number" id="productPriceInput" min="0" step="0.01" placeholder="0.00" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" onclick="closeAddProductModal()" class="btn-secondary" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                            <button type="submit" class="btn-primary" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Product</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // Add submit handler only once
            document.getElementById('addProductForm').addEventListener('submit', handleProductSubmit);
        } else {
            // Update dropdowns if modal already exists
            const categorySelect = modal.querySelector('#productCategorySelect');
            const unitSelect = modal.querySelector('#productUnitSelect');
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Select Category</option>' +
                    categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
            }
            if (unitSelect) {
                unitSelect.innerHTML = '<option value="">Select Unit</option>' +
                    units.map(unit => `<option value="${unit.unit_id}">${unit.unit_name} (${unit.unit_symbol})</option>`).join('');
            }
        }

        modal.style.display = 'flex';
    } catch (err) {
        console.error('Error loading data for modal:', err);
        showAdminToast('Failed to load categories', 'error');
    }
}

// Separate submit handler function
async function handleProductSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('productNameInput').value.trim();
    const categoryID = document.getElementById('productCategorySelect').value;
    const size = document.getElementById('productSizeInput').value.trim();
    const unitID = document.getElementById('productUnitSelect').value;
    const price = parseFloat(document.getElementById('productPriceInput').value) || 0;
    if (!name || !categoryID || !unitID) {
        showAdminToast('Please enter name, select category, and unit', 'error');
        return;
    }
    closeAddProductModal();
    await addAdminProduct(name, parseInt(categoryID), size, parseInt(unitID), price);
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) modal.remove();
}

// Add Category
async function addAdminCategory(categoryName) {
    const formData = new FormData();
    formData.append('categoryName', categoryName);
    
    try {
        const response = await fetch('db/categories_add.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            showAdminToast('Category added successfully!', 'success');
            loadAdminCategories();
            loadAdminProducts();
        } else {
            showAdminToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showAdminToast('Failed to add category', 'error');
    }
}

// Add Size
async function addAdminSize(sizeName, price) {
    const formData = new FormData();
    formData.append('sizeName', sizeName);
    formData.append('price', price);
    
    try {
        const response = await fetch('db/sizes_add.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            showAdminToast('Size added successfully!', 'success');
            loadAdminSizes();
            loadAdminProducts();
        } else {
            showAdminToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding size:', error);
        showAdminToast('Failed to add size', 'error');
    }
}

async function addAdminProduct(productName, categoryID, size, unitID, price) {
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('categoryID', categoryID);
    formData.append('size', size);
    formData.append('unit_id', unitID);
    formData.append('price', price);
    formData.append('isActive', '1');

    try {
        const response = await fetch('db/products_add.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.status === 'success') {
            showAdminToast('Product added successfully!', 'success');
            loadAdminProducts();
        } else {
            showAdminToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showAdminToast('Failed to add product', 'error');
    }
}

// Edit Product
function editAdminProduct(productID) {
    if (window.USER_ROLE !== 'admin') {
        showAdminToast('Only administrators can edit products', 'warning');
        return;
    }

    const product = adminProducts.find(p => p.productID == productID);
    if (!product) {
        showAdminToast('Product not found', 'error');
        return;
    }

    showEditProductModal(product);
}

// Show Edit Product Modal
function showEditProductModal(product) {
    // Check if modal already exists
    let modal = document.getElementById('editProductModal');
    if (!modal) {
        // Create modal
        modal = document.createElement('div');
        modal.id = 'editProductModal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: none; align-items: center; justify-content: center;
        `;
        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Edit Product</h3>
                    <span class="close" onclick="closeEditProductModal()" style="cursor: pointer; font-size: 24px; font-weight: bold;">&times;</span>
                </div>
                <form id="editProductForm">
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductImage">Image URL:</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img id="editProductImagePreview" src="assest/image/no-image.png" alt="Product Image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                            <button type="button" id="editProductImageBtn" class="btn-secondary" style="padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Upload Image</button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductName">Product Name:</label>
                        <input type="text" id="editProductName" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductCategory">Category:</label>
                        <select id="editProductCategory" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Select Category</option>
                        </select>
                    </div>
                    <div class="form-row" style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <div class="form-group" style="flex: 1;">
                            <label for="editProductSize">Size:</label>
                            <select id="editProductSize" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="">Select Size</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="editProductUnit">Unit:</label>
                            <select id="editProductUnit" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="">Select Unit</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductPrice">Price (₱):</label>
                        <input type="number" id="editProductPrice" min="0" step="0.01" placeholder="0.00" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductStatus">Status:</label>
                        <select id="editProductStatus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeEditProductModal()" class="btn-secondary" style="padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                        <button type="submit" class="btn-primary" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Product</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Add submit handler
        document.getElementById('editProductForm').addEventListener('submit', handleEditProductSubmit);

        // Add image upload button handler
        document.getElementById('editProductImageBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        showAdminToast('Image too large (max 5MB)', 'error');
                        return;
                    }
                    // Preview the image
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('editProductImagePreview').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                    // Store file for upload
                    modal.dataset.selectedFile = file;
                }
            };
            input.click();
        });
    }

    // Store product ID in modal for later use
    modal.dataset.productId = product.productID;

    // Populate form with product data
    document.getElementById('editProductName').value = product.productName || '';
    document.getElementById('editProductImagePreview').src = product.image_url || 'assest/image/no-image.png';
    document.getElementById('editProductStatus').value = product.isActive ? '1' : '0';

    // Populate categories
    const categorySelect = document.getElementById('editProductCategory');
    categorySelect.innerHTML = '<option value="">Select Category</option>' +
        adminCategories.map(cat => `<option value="${cat.categoryID}" ${cat.categoryID == product.categoryID ? 'selected' : ''}>${cat.categoryName}</option>`).join('');

    // Populate sizes
    const sizeSelect = document.getElementById('editProductSize');
    sizeSelect.innerHTML = '<option value="">Select Size</option>' +
        adminSizes.map(size => `<option value="${size.sizeID}">${size.sizeName.replace('oz', '').trim()}</option>`).join('');

    // Populate units
    const unitSelect = document.getElementById('editProductUnit');
    unitSelect.innerHTML = '<option value="">Select Unit</option>' +
        [...new Map(adminUnits.filter(unit => unit.unit_symbol === 'oz' || unit.unit_symbol === 'pc').map(unit => [unit.unit_symbol, unit])).values()].map(unit => `<option value="${unit.unit_id}">${unit.unit_name} (${unit.unit_symbol})</option>`).join('');

    // Try to fetch current price for the product
    const savedSize = localStorage.getItem(`product_${product.productID}_size`);
    const savedUnit = localStorage.getItem(`product_${product.productID}_unit`);
    if (savedSize && savedUnit) {
        sizeSelect.value = savedSize;
        unitSelect.value = savedUnit;
        // Fetch price
        fetch(`db/product_prices_get.php?productID=${product.productID}&sizeID=${savedSize}&unit_id=${savedUnit}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('editProductPrice').value = data.price !== null ? data.price : '';
            })
            .catch(error => console.error('Error fetching price:', error));
    }

    // Add event listeners for dynamic price updates
    const handlePriceUpdate = () => updateEditModalPrice(product.productID, sizeSelect, unitSelect, document.getElementById('editProductPrice'));
    sizeSelect.addEventListener('change', handlePriceUpdate);
    unitSelect.addEventListener('change', handlePriceUpdate);

    // Trigger initial price fetch if both size and unit are selected
    if (sizeSelect.value && unitSelect.value) {
        handlePriceUpdate();
    }

    modal.style.display = 'flex';
}

function closeEditProductModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.style.display = 'none';
        modal.dataset.selectedFile = '';
    }
}

// Handle Edit Product Submit
async function handleEditProductSubmit(e) {
    e.preventDefault();

    const productID = document.getElementById('editProductModal').dataset.productId;
    const name = document.getElementById('editProductName').value.trim();
    const categoryID = document.getElementById('editProductCategory').value;
    const sizeID = document.getElementById('editProductSize').value;
    const unitID = document.getElementById('editProductUnit').value;
    const price = parseFloat(document.getElementById('editProductPrice').value) || 0;
    const isActive = document.getElementById('editProductStatus').value;
    const selectedFile = document.getElementById('editProductModal').dataset.selectedFile;

    if (!name || !categoryID) {
        showAdminToast('Please enter product name and select category', 'error');
        return;
    }

    try {
        // Update product basic info
        const formData = new FormData();
        formData.append('productID', productID);
        formData.append('productName', name);
        formData.append('categoryID', categoryID);
        formData.append('isActive', isActive);

        const response = await fetch('db/products_update.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.status !== 'success') {
            showAdminToast('Error updating product: ' + data.message, 'error');
            return;
        }

        // Update price if size and unit are selected
        if (sizeID && unitID) {
            const priceFormData = new FormData();
            priceFormData.append('productID', productID);
            priceFormData.append(`price_${sizeID}_${unitID}`, price);

            await fetch('db/product_prices_set.php', {
                method: 'POST',
                body: priceFormData
            });
        }

        // Upload image if selected
        if (selectedFile) {
            const imageFormData = new FormData();
            imageFormData.append('productID', productID);
            imageFormData.append('productImage', selectedFile);

            const imageResponse = await fetch('db/upload_product_image.php', {
                method: 'POST',
                body: imageFormData
            });
            const imageData = await imageResponse.json();
            if (imageData.status !== 'success') {
                showAdminToast('Product updated but image upload failed', 'warning');
            }
        }

        showAdminToast('Product updated successfully!', 'success');
        closeEditProductModal();
        loadAdminProducts();

    } catch (error) {
        console.error('Error updating product:', error);
        showAdminToast('Failed to update product', 'error');
    }
}

// Update Product (legacy function - kept for compatibility)
async function updateAdminProduct(productID, newName) {
    const formData = new FormData();
    formData.append('productID', productID);
    formData.append('productName', newName);

    try {
        const response = await fetch('db/products_update.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.status === 'success') {
            showAdminToast('Product updated successfully!', 'success');
            loadAdminProducts();
        } else {
            showAdminToast('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showAdminToast('Failed to update product', 'error');
    }
}

// Delete Product
function deleteAdminProduct(productID) {
    if (window.USER_ROLE !== 'admin') {
        showAdminToast('Only administrators can delete products', 'warning');
        return;
    }
    
    const product = adminProducts.find(p => p.productID == productID);
    if (!product) {
        showAdminToast('Product not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${product.productName}"?`)) {
        const formData = new FormData();
        formData.append('productID', productID);
        
        fetch('db/products_delete.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showAdminToast('Product deleted successfully!', 'success');
                loadAdminProducts();
            } else {
                showAdminToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            showAdminToast('Failed to delete product', 'error');
        });
    }
}

// Toast notification system
function showAdminToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '300px',
        wordWrap: 'break-word',
        fontFamily: 'Fredoka, sans-serif'
    });
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Image Upload Modal Functions
function showImageUploadModal() {
    if (window.USER_ROLE !== 'admin') {
        showAdminToast('Only administrators can upload images', 'warning');
        return;
    }

    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'block';
        // Populate product select if not already
        const productSelect = document.getElementById('productSelect');
        if (productSelect && adminProducts.length > 0) {
            productSelect.innerHTML = '<option value="">Choose a product...</option>' +
                adminProducts.map(p => `<option value="${p.productID}">${p.productName}</option>`).join('');
        }
    } else {
        showAdminToast('Upload modal not found', 'error');
    }

    // Add one-time submit handler if not already added
    const form = document.getElementById('imageUploadForm');
    if (form && !form.dataset.handlerAdded) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productID = document.getElementById('productSelect').value;
            const fileInput = document.getElementById('productImage');
            const file = fileInput.files[0];
            if (!productID || !file) {
                showAdminToast('Please select product and image', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showAdminToast('Image too large (max 5MB)', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('productID', productID);
            formData.append('productImage', file);

            try {
                const response = await fetch('db/upload_product_image.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.status === 'success') {
                    showAdminToast('Image uploaded successfully!', 'success');
                    closeImageUploadModal();
                    loadAdminProducts(); // Reload to show new image
                } else {
                    showAdminToast('Upload failed: ' + (data.message || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showAdminToast('Upload failed', 'error');
            }
        });
        form.dataset.handlerAdded = 'true';
    }
}

function closeImageUploadModal() {
    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('imageUploadForm');
        if (form) {
            form.reset();
            const productSelect = document.getElementById('productSelect');
            if (productSelect) productSelect.innerHTML = '<option value="">Choose a product...</option>';
        }
    }
}

// Handle size/unit change to fetch existing price
async function handleAdminSizeUnitChange(e) {
    if (!e.target.classList.contains('size-dropdown') && !e.target.classList.contains('unit-dropdown')) return;

    const productId = e.target.dataset.productId;
    const row = e.target.closest('tr');
    const sizeSelect = row.querySelector('.size-dropdown');
    const unitSelect = row.querySelector('.unit-dropdown');
    const priceInput = row.querySelector('.price-input');

    const sizeId = sizeSelect.value;
    const unitId = unitSelect.value;

    // Save selections to localStorage
    localStorage.setItem(`product_${productId}_size`, sizeId);
    localStorage.setItem(`product_${productId}_unit`, unitId);

    if (!sizeId || !unitId) {
        priceInput.value = '';
        return;
    }

    try {
        const response = await fetch(`db/product_prices_get.php?productID=${productId}&sizeID=${sizeId}&unit_id=${unitId}`);
        const data = await response.json();
        priceInput.value = data.price !== null ? data.price : '';
    } catch (error) {
        console.error('Error fetching price:', error);
        showAdminToast('Failed to fetch price', 'error');
    }
}

// Handle price input change to save
async function handleAdminPriceChange(e) {
    if (!e.target.classList.contains('price-input')) return;

    const productId = e.target.dataset.productId;
    const row = e.target.closest('tr');
    const sizeSelect = row.querySelector('.size-dropdown');
    const unitSelect = row.querySelector('.unit-dropdown');
    const price = parseFloat(e.target.value) || 0;

    const sizeId = sizeSelect.value;
    const unitId = unitSelect.value;

    if (!sizeId || !unitId) {
        showAdminToast('Please select size and unit first', 'warning');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('productID', productId);
        formData.append(`price_${sizeId}_${unitId}`, price);

        const response = await fetch('db/product_prices_set.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.status === 'success') {
            showAdminToast('Price saved successfully', 'success');
        } else {
            showAdminToast(result.message || 'Failed to save price', 'error');
        }
    } catch (error) {
        console.error('Error saving price:', error);
        showAdminToast('Failed to save price', 'error');
    }
}

// Handle product checkbox changes
function handleProductCheckboxChange(e) {
    if (!e.target.classList.contains('product-checkbox')) return;

    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const massDeleteBtn = document.getElementById('massDeleteBtn');

    if (checkedBoxes.length > 0) {
        if (!massDeleteBtn) {
            createMassDeleteButton();
        } else {
            massDeleteBtn.style.display = 'inline-block';
        }
    } else {
        if (massDeleteBtn) {
            massDeleteBtn.style.display = 'none';
        }
    }
}

// Create mass delete button
function createMassDeleteButton() {
    const uploadBtn = document.getElementById('uploadImageBtn') || document.querySelector('[onclick="showImageUploadModal()"]');
    if (!uploadBtn) return;

    const massDeleteBtn = document.createElement('button');
    massDeleteBtn.id = 'massDeleteBtn';
    massDeleteBtn.className = 'btn-danger';
    massDeleteBtn.style.cssText = `
        margin-left: 10px;
        padding: 8px 16px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: inline-block;
    `;
    massDeleteBtn.innerHTML = '<ion-icon name="trash-outline"></ion-icon> Delete Selected';
    massDeleteBtn.onclick = massDeleteAdminProducts;

    uploadBtn.parentNode.insertBefore(massDeleteBtn, uploadBtn.nextSibling);
}

// Mass delete selected products
async function massDeleteAdminProducts() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    if (checkedBoxes.length === 0) {
        showAdminToast('No products selected', 'warning');
        return;
    }

    const productIds = Array.from(checkedBoxes).map(cb => cb.dataset.productId);
    const productNames = productIds.map(id => {
        const product = adminProducts.find(p => p.productID == id);
        return product ? product.productName : 'Unknown';
    });

    const confirmMessage = `Are you sure you want to delete ${productIds.length} selected product(s)?\n\n${productNames.join('\n')}`;
    if (!confirm(confirmMessage)) return;

    let successCount = 0;
    let errorCount = 0;

    for (const productId of productIds) {
        try {
            const formData = new FormData();
            formData.append('productID', productId);

            const response = await fetch('db/products_delete.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                successCount++;
            } else {
                errorCount++;
                console.error('Error deleting product', productId, data.message);
            }
        } catch (error) {
            errorCount++;
            console.error('Error deleting product', productId, error);
        }
    }

    // Reload products
    loadAdminProducts();

    // Hide mass delete button
    const massDeleteBtn = document.getElementById('massDeleteBtn');
    if (massDeleteBtn) {
        massDeleteBtn.style.display = 'none';
    }

    // Show result message
    if (errorCount === 0) {
        showAdminToast(`Successfully deleted ${successCount} product(s)`, 'success');
    } else if (successCount === 0) {
        showAdminToast('Failed to delete selected products', 'error');
    } else {
        showAdminToast(`Deleted ${successCount} product(s), ${errorCount} failed`, 'warning');
    }
}

// Expose functions globally
window.showAddCategoryModal = showAddCategoryModal;
window.showAddSizeModal = showAddSizeModal;
window.showAddProductModal = showAddProductModal;
window.showImageUploadModal = showImageUploadModal;
window.closeImageUploadModal = closeImageUploadModal;
window.closeEditProductModal = closeEditProductModal;
window.loadProducts = loadAdminProducts; // Override the global loadProducts function
window.editAdminProduct = editAdminProduct;
window.massDeleteAdminProducts = massDeleteAdminProducts;
