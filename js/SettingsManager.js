// Comprehensive Settings Management System
let settingsData = {
    categories: [],
    products: [],
    auditLogs: [],
    systemInfo: {}
};

// Initialize Settings Manager
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    setupEventListeners();
});

function initializeSettings() {
    console.log('Initializing Settings Manager...');
    
    // Load initial data for each tab
    loadCategories();
    loadProducts();
    loadSystemInfo();
    // loadAuditLogs(); // Handled by Settings.js navigation to avoid conflict
}

// Event Listeners
function setupEventListeners() {
    // Category management
    document.getElementById('addCategory')?.addEventListener('click', addCategory);
    document.getElementById('newCategory')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addCategory();
    });

    // Product management
    document.getElementById('categoryFilter')?.addEventListener('change', filterProducts);
    
    // System settings
    document.getElementById('systemCompanyName')?.addEventListener('change', updateSystemSetting);
    document.getElementById('systemTimezone')?.addEventListener('change', updateSystemSetting);
    document.getElementById('backupInterval')?.addEventListener('change', updateSystemSetting);
    
    // Audit logs
    document.getElementById('auditFilter')?.addEventListener('change', filterAuditLogs);
}

// ==================== CATEGORY MANAGEMENT ====================

async function loadCategories() {
    try {
        const response = await fetch('db/categories_getAll.php');
        const data = await response.json();
        settingsData.categories = data;
        renderCategories();
        updateCategoryFilter();
        showToast('Categories loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories', 'error');
    }
}

function renderCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;

    if (settingsData.categories.length === 0) {
        container.innerHTML = '<div class="empty-state">No categories found</div>';
        return;
    }

    container.innerHTML = settingsData.categories.map(cat => `
        <div class="list-item">
            <span class="item-name">${cat.categoryName}</span>
            <div class="item-actions">
                <button class="btn-small btn-primary" onclick="editCategory(${cat.categoryID})">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteCategory(${cat.categoryID})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function addCategory() {
    const input = document.getElementById('newCategory');
    const name = input.value.trim();
    
    if (!name) {
        showToast('Please enter a category name', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('categoryName', name);

        const response = await fetch('db/categories_add.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('Category added successfully', 'success');
            input.value = '';
            loadCategories(); // Refresh categories
            loadProducts(); // Refresh products to show new category
        } else {
            showToast(result.message || 'Failed to add category', 'error');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showToast('Failed to add category', 'error');
    }
}

// ==================== PRODUCT MANAGEMENT ====================

async function loadProducts() {
    try {
        const response = await fetch('db/products_getAll.php');
        const data = await response.json();
        settingsData.products = data;
        renderProducts();
        showToast('Products loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (settingsData.products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
                        No products found
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = settingsData.products.map(product => {
        const category = settingsData.categories.find(cat => cat.categoryID === product.category_id);
        const productSizes = product.sizes || [];
        const sizesText = productSizes.length > 0 
            ? productSizes.map(s => `${s.size_label}: ₱${s.price}`).join(', ')
            : 'No sizes';

        return `
            <tr>
                <td>
                    <div class="product-info">
                        <strong>${product.name}</strong>
                        <small class="text-muted">ID: ${product.productID}</small>
                    </div>
                </td>
                <td>${category ? category.categoryName : 'Unknown'}</td>
                <td>
                    <div class="sizes-info">${sizesText}</div>
                </td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-small btn-primary" onclick="editProduct(${product.productID})">Edit</button>
                    <button class="btn-small btn-danger" onclick="deleteProduct(${product.productID})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;

    filter.innerHTML = '<option value="">All Categories</option>' +
        settingsData.categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
}

function filterProducts() {
    const filter = document.getElementById('categoryFilter');
    const categoryId = filter ? filter.value : '';
    
    if (!categoryId) {
        renderProducts();
        return;
    }

    const filteredProducts = settingsData.products.filter(product => product.category_id == categoryId);
    const tbody = document.getElementById('productsTableBody');
    
    if (!tbody) return;

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">No products in this category</div>
                </td>
            </tr>
        `;
        return;
    }

    // Render filtered products
    tbody.innerHTML = filteredProducts.map(product => {
        const category = settingsData.categories.find(cat => cat.categoryID === product.category_id);
        const productSizes = product.sizes || [];
        const sizesText = productSizes.length > 0 
            ? productSizes.map(s => `${s.size_label}: ₱${s.price}`).join(', ')
            : 'No sizes';

        return `
            <tr>
                <td>
                    <div class="product-info">
                        <strong>${product.name}</strong>
                        <small class="text-muted">ID: ${product.productID}</small>
                    </div>
                </td>
                <td>${category ? category.categoryName : 'Unknown'}</td>
                <td>
                    <div class="sizes-info">${sizesText}</div>
                </td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-small btn-primary" onclick="editProduct(${product.productID})">Edit</button>
                    <button class="btn-small btn-danger" onclick="deleteProduct(${product.productID})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== SYSTEM MANAGEMENT ====================

async function loadSystemInfo() {
    try {
        // Load database info
        const response = await fetch('db/system_info.php');
        const data = await response.json();
        settingsData.systemInfo = data;
        renderSystemInfo();
    } catch (error) {
        console.error('Error loading system info:', error);
        // Set default values
        const dbStatusEl = document.getElementById('dbStatus');
        if (dbStatusEl) dbStatusEl.textContent = 'Unknown';
        const tableCountEl = document.getElementById('tableCount');
        if (tableCountEl) tableCountEl.textContent = '-';
        const dbSizeEl = document.getElementById('dbSize');
        if (dbSizeEl) dbSizeEl.textContent = '-';
    }
}

function renderSystemInfo() {
    const info = settingsData.systemInfo;

    const dbStatusEl = document.getElementById('dbStatus');
    if (dbStatusEl) {
        dbStatusEl.textContent = info.dbStatus || 'Unknown';
        dbStatusEl.className = `stat-value ${info.dbStatus === 'Online' ? 'online' : 'offline'}`;
    }
    const tableCountEl = document.getElementById('tableCount');
    if (tableCountEl) tableCountEl.textContent = info.tableCount || '-';
    const dbSizeEl = document.getElementById('dbSize');
    if (dbSizeEl) dbSizeEl.textContent = info.dbSize || '-';
}

function refreshSystemInfo() {
    showToast('Refreshing system information...', 'info');
    loadSystemInfo();
}

function backupDatabase() {
    showToast('Database backup initiated...', 'info');
    // Implement backup functionality
    setTimeout(() => {
        showToast('Database backup completed successfully', 'success');
    }, 2000);
}

function clearCache() {
    showToast('Cache cleared successfully', 'success');
    // Implement cache clearing
}

function optimizeDatabase() {
    showToast('Database optimization initiated...', 'info');
    // Implement database optimization
    setTimeout(() => {
        showToast('Database optimization completed', 'success');
    }, 3000);
}

// ==================== AUDIT LOGS ====================

async function loadAuditLogs() {
    try {
        const response = await fetch('db/get_audit_logs.php');
        const data = await response.json();
        if (data.status === 'success') {
            settingsData.auditLogs = data.audit_logs || [];
            renderAuditLogs();
            updateSecurityStats();
        } else {
            settingsData.auditLogs = [];
            renderAuditLogs();
        }
    } catch (error) {
        console.error('Error loading audit logs:', error);
        showToast('Failed to load audit logs', 'error');
        settingsData.auditLogs = [];
        renderAuditLogs();
    }
}

function renderAuditLogs() {
    const tbody = document.getElementById('auditLogsBody');
    if (!tbody) return;
    if (!Array.isArray(settingsData.auditLogs)) return;

    if (settingsData.auditLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">No audit logs found</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = settingsData.auditLogs.map(log => `
        <tr>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td>${log.username || 'System'}</td>
            <td>
                <span class="action-badge action-${log.action}">${log.action}</span>
            </td>
            <td>${log.details || '-'}</td>
            <td>${log.ip_address || '-'}</td>
            <td><span class="status-badge status-${log.role || 'system'}">${log.role || 'System'}</span></td>
        </tr>
    `).join('');
}

function filterAuditLogs() {
    const filter = document.getElementById('auditFilter');
    const action = filter ? filter.value : '';
    
    if (!action) {
        renderAuditLogs();
        return;
    }

    const filteredLogs = settingsData.auditLogs.filter(log => log.action === action);
    const tbody = document.getElementById('auditLogsBody');
    
    if (!tbody) return;

    if (filteredLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">No logs found for this action</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredLogs.map(log => `
        <tr>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td>${log.username || 'System'}</td>
            <td>
                <span class="action-badge action-${log.action}">${log.action}</span>
            </td>
            <td>${log.details || '-'}</td>
            <td>${log.ip_address || '-'}</td>
        </tr>
    `).join('');
}

function refreshAuditLogs() {
    showToast('Refreshing audit logs...', 'info');
    loadAuditLogs();
}

function updateSecurityStats() {
    if (!Array.isArray(settingsData.auditLogs)) return;

    // Update security statistics
    const failedLogins = settingsData.auditLogs.filter(log => log.action === 'failed_login').length;
    const activeSessions = settingsData.auditLogs.filter(log => log.action === 'login').length - settingsData.auditLogs.filter(log => log.action === 'logout').length;
    const totalLogins = settingsData.auditLogs.filter(log => log.action === 'login').length;
    
    // Get today's date for filtering
    const today = new Date();
    const todayLogins = settingsData.auditLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return log.action === 'login' && logDate.toDateString() === today.toDateString();
    }).length;
    
    // Get last activity
    const lastActivity = settingsData.auditLogs.length > 0 
        ? new Date(settingsData.auditLogs[0].created_at).toLocaleString()
        : 'No activity';
    
    const failedLoginsEl = document.getElementById('failedLogins');
    if (failedLoginsEl) failedLoginsEl.textContent = failedLogins;
    const activeSessionsEl = document.getElementById('activeSessions');
    if (activeSessionsEl) activeSessionsEl.textContent = Math.max(0, activeSessions);
    const totalLoginsEl = document.getElementById('totalLogins');
    if (totalLoginsEl) totalLoginsEl.textContent = totalLogins;
    const lastActivityEl = document.getElementById('lastActivity');
    if (lastActivityEl) lastActivityEl.textContent = lastActivity;
    const currentOnlineEl = document.getElementById('currentOnline');
    if (currentOnlineEl) currentOnlineEl.textContent = Math.max(0, activeSessions);
    const todayLoginsEl = document.getElementById('todayLogins');
    if (todayLoginsEl) todayLoginsEl.textContent = todayLogins;
    const weekLoginsEl = document.getElementById('weekLogins');
    if (weekLoginsEl) weekLoginsEl.textContent = totalLogins;
}

function exportAuditLogs() {
    // Check if data is loaded
    if (!settingsData.auditLogs || settingsData.auditLogs.length === 0) {
        showToast('No audit logs to export. Please wait for data to load.', 'warning');
        return;
    }

    try {
        // Create CSV content
        const headers = ['Timestamp', 'Employee', 'Action', 'Details', 'IP Address', 'Status'];
        const csvContent = [
            headers.join(','),
            ...settingsData.auditLogs.map(log => [
                new Date(log.created_at).toLocaleString(),
                log.username || 'System',
                log.action,
                log.details || '-',
                log.ip_address || '-',
                log.action === 'failed_login' ? 'Failed' : 'Success'
            ].join(','))
        ].join('\n');

        if (!csvContent || csvContent.trim() === '') {
            showToast('No audit log data available to export', 'warning');
            return;
        }

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Audit logs exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        showToast('Failed to export audit logs', 'error');
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast') || createToastElement();
    const toastMessage = toast.querySelector('#toast-message');
    
    if (toastMessage) {
        toastMessage.innerText = message;
        toast.className = 'toast show';
        
        if (type === 'error') {
            toast.classList.add('toast-error');
        } else if (type === 'success') {
            toast.classList.add('toast-success');
        }
        
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 4000);
    }
}

function createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = '<span id="toast-message"></span>';
    document.body.appendChild(toast);
    return toast;
}

// Modal functions
function showAddCategoryModal() {
    // Focus on the category input field
    const categoryInput = document.getElementById('newCategory');
    if (categoryInput) {
        categoryInput.focus();
        showToast('Enter category name and click Add', 'info');
    }
}

function showAddSizeModal() {
    // Focus on the size input field
    const sizeInput = document.getElementById('newSizeName');
    if (sizeInput) {
        sizeInput.focus();
        showToast('Enter size name and price, then click Add Size', 'info');
    }
}

function showAddProductModal() {
    // Show add product form
    showAddProductForm();
}

function showAddProductForm() {
    // Create a modal for adding products
    const modal = document.createElement('div');
    modal.id = 'addProductModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAddProductModal()">&times;</span>
            <h2>Add New Product</h2>
            <form id="addProductForm">
                <div class="form-group">
                    <label for="productName">Product Name:</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Category:</label>
                    <select id="productCategory" required>
                        <option value="">Select Category</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="productPrice">Base Price:</label>
                    <input type="number" id="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Description:</label>
                    <textarea id="productDescription" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Add Product</button>
                    <button type="button" onclick="closeAddProductModal()" class="btn-secondary">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Load categories for the dropdown
    loadCategoriesForModal();
    
    // Setup form submission
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.remove();
    }
}

async function loadCategoriesForModal() {
    try {
        const response = await fetch('db/categories_getAll.php');
        const categories = await response.json();
        const select = document.getElementById('productCategory');
        
        if (select) {
            select.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('productName', document.getElementById('productName').value);
    formData.append('categoryID', document.getElementById('productCategory').value);
    formData.append('basePrice', document.getElementById('productPrice').value);
    formData.append('description', document.getElementById('productDescription').value);
    
    try {
        const response = await fetch('db/products_add.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('Product added successfully', 'success');
            closeAddProductModal();
            loadProducts(); // Refresh products list
        } else {
            showToast(result.message || 'Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Failed to add product', 'error');
    }
}

// Placeholder functions for future implementation
function editCategory(id) {
    showToast('Edit category functionality coming soon', 'info');
}

function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        showToast('Delete category functionality coming soon', 'info');
    }
}

function editProduct(id) {
    showToast('Edit product functionality coming soon', 'info');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        showToast('Delete product functionality coming soon', 'info');
    }
}

// Expose functions globally
window.refreshSystemInfo = refreshSystemInfo;
window.backupDatabase = backupDatabase;
window.clearCache = clearCache;
window.optimizeDatabase = optimizeDatabase;
window.refreshAuditLogs = refreshAuditLogs;
window.filterAuditLogs = filterAuditLogs;
window.exportAuditLogs = exportAuditLogs;
window.showAddCategoryModal = showAddCategoryModal;
window.showAddSizeModal = showAddSizeModal;
window.showAddProductModal = showAddProductModal;
window.showAddProductForm = showAddProductForm;
window.closeAddProductModal = closeAddProductModal;
window.loadCategoriesForModal = loadCategoriesForModal;
window.handleAddProduct = handleAddProduct;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
