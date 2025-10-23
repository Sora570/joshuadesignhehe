// Inventory Management JavaScript

let inventoryData = [];
let filteredData = [];

// Initialize inventory when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeInventory();
});

function initializeInventory() {
    loadInventoryData();
    setupEventListeners();
    loadCategories();
}

function setupEventListeners() {
    // Export Button
    document.getElementById('exportInventoryBtn').addEventListener('click', exportInventory);
    
    // Search and Filter
    document.getElementById('inventorySearch').addEventListener('input', filterInventory);
    document.getElementById('categoryFilter').addEventListener('change', filterInventory);
    document.getElementById('stockFilter').addEventListener('change', filterInventory);
}

function loadInventoryData() {
    
    fetch('db/inventory_get.php')
        .then(response => response.json())
        .then(data => {
            inventoryData = data;
            filteredData = [...inventoryData];
            displayInventoryTable();
            updateSummaryCards();
        })
        .catch(error => {
            console.error('Error loading inventory:', error);
            showToast('Error loading inventory data', 'error');
        });
}

function displayInventoryTable() {
    const tbody = document.getElementById('inventory-table-list');
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 40px; color: #999;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <div style="font-size: 48px;">📦</div>
                        <div style="font-size: 18px; font-weight: 600; color: #7f5539;">No inventory items found</div>
                        <div style="color: #6b7280;">Click "Add Stock" to start adding inventory items</div>
                        <button onclick="showAddStockModal()" class="btn-primary" style="margin-top: 10px;">
                            + Add Inventory Item
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach(item => {
        const row = createInventoryRow(item);
        tbody.appendChild(row);
    });
}

function createInventoryRow(item) {
    const row = document.createElement('tr');

    const status = item.Status || 'Active';
    const statusClass = `status-${status.toLowerCase().replace(' ', '-')}`;

    row.innerHTML = `
        <td class="font-medium text-gray-800">${item['InventoryName']}</td>
        <td class="text-gray-600">${item['Category']}</td>
        <td class="text-gray-600">${item['Size']}</td>
        <td class="text-gray-600">${item['Unit']}</td>
        <td class="text-center font-semibold text-gray-800">${item['Current Stock']}</td>
        <td class="text-center font-semibold text-gray-800">₱${(item['Cost Price'] || 0).toFixed(2)}</td>
        <td class="text-center font-semibold text-blue-600">
            ₱${(item['Total Value'] || 0).toFixed(2)}
        </td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
            <div class="action-buttons">
                <button class="action-btn btn-edit" onclick="showUpdateInventoryModal(${item.inventoryID})">
                    Edit
                </button>
            </div>
        </td>
    `;

    // Add smooth animation when row is added
    row.style.opacity = '0';
    row.style.transform = 'translateY(20px)';

    setTimeout(() => {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    }, 100);

    return row;
}

function getStockStatus(currentStock, minStock) {
    if (currentStock === 0) return 'out of stock';
    if (currentStock <= minStock) return 'low stock';
    return 'in stock';
}

function updateSummaryCards() {
    const totalItems = inventoryData.length;
    const lowStockItems = inventoryData.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock).length;
    const inStockItems = inventoryData.filter(item => item.currentStock > item.minStock).length;
    const outOfStockItems = inventoryData.filter(item => item.currentStock === 0).length;
    
    // Calculate total value and profit
    const totalValue = inventoryData.reduce((sum, item) => sum + (parseFloat(item.totalValue) || 0), 0);
    const totalCost = inventoryData.reduce((sum, item) => sum + (parseFloat(item.costPrice) || 0) * item.currentStock, 0);
    const totalSellingValue = inventoryData.reduce((sum, item) => sum + (parseFloat(item.sellingPrice) || 0) * item.currentStock, 0);
    const totalProfit = totalSellingValue - totalCost;
    const averageProfitMargin = inventoryData.length > 0 ? 
        inventoryData.reduce((sum, item) => sum + (parseFloat(item.profitMargin) || 0), 0) / inventoryData.length : 0;
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('inStockItems').textContent = inStockItems;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    
    // Update summary cards with additional info
    const totalItemsCard = document.querySelector('.summary-card:nth-child(1) .summary-label');
    const lowStockCard = document.querySelector('.summary-card:nth-child(2) .summary-label');
    const inStockCard = document.querySelector('.summary-card:nth-child(3) .summary-label');
    const outOfStockCard = document.querySelector('.summary-card:nth-child(4) .summary-label');
    
    if (totalItemsCard) totalItemsCard.textContent = `Total Items (₱${totalValue.toFixed(2)} value)`;
    if (lowStockCard) lowStockCard.textContent = `Low Stock (${lowStockItems} items)`;
    if (inStockCard) inStockCard.textContent = `In Stock (${inStockItems} items)`;
    if (outOfStockCard) outOfStockCard.textContent = `Out of Stock (${outOfStockItems} items)`;
}

function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;

    filteredData = inventoryData.filter(item => {
        const matchesSearch = item['InventoryName'].toLowerCase().includes(searchTerm) ||
                            item['Category'].toLowerCase().includes(searchTerm) ||
                            item['Size'].toLowerCase().includes(searchTerm);

        const matchesCategory = !categoryFilter || item['Category'].toLowerCase().includes(categoryFilter.toLowerCase());

        let matchesStock = true;
        if (stockFilter) {
            const status = item['Status'].toLowerCase();
            if (stockFilter === 'active') {
                matchesStock = status === 'active';
            } else if (stockFilter === 'inactive') {
                matchesStock = status === 'inactive';
            }
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    displayInventoryTable();
}

function loadCategories() {
    fetch('db/categories_getAll.php')
        .then(response => response.json())
        .then(categories => {
            const select = document.getElementById('categoryFilter');
            select.innerHTML = '<option value="">All Categories</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryID;
                option.textContent = category.categoryName;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

function updateStock(inventoryID, newStock) {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
        showToast('Invalid stock quantity', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&currentStock=${stock}&action=update_stock`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Stock updated successfully', 'success');
            loadInventoryData(); // Refresh data
        } else {
            showToast(data.message || 'Error updating stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating stock:', error);
        showToast('Error updating stock', 'error');
    });
}

function updateMinStock(inventoryID, newMinStock) {
    const minStock = parseInt(newMinStock);
    if (isNaN(minStock) || minStock < 0) {
        showToast('Invalid minimum stock quantity', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&minStock=${minStock}&action=update_min_stock`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Minimum stock updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating minimum stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating minimum stock:', error);
        showToast('Error updating minimum stock', 'error');
    });
}

function updateMaxStock(inventoryID, newMaxStock) {
    const maxStock = parseInt(newMaxStock);
    if (isNaN(maxStock) || maxStock < 0) {
        showToast('Invalid maximum stock quantity', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&maxStock=${maxStock}&action=update_max_stock`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Maximum stock updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating maximum stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating maximum stock:', error);
        showToast('Error updating maximum stock', 'error');
    });
}

function updateCostPrice(inventoryID, newCostPrice) {
    const costPrice = parseFloat(newCostPrice);
    if (isNaN(costPrice) || costPrice < 0) {
        showToast('Invalid cost price', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&costPrice=${costPrice}&action=update_cost_price`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Cost price updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating cost price', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating cost price:', error);
        showToast('Error updating cost price', 'error');
    });
}

function updateSellingPrice(inventoryID, newSellingPrice) {
    const sellingPrice = parseFloat(newSellingPrice);
    if (isNaN(sellingPrice) || sellingPrice < 0) {
        showToast('Invalid selling price', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&sellingPrice=${sellingPrice}&action=update_selling_price`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Selling price updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating selling price', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating selling price:', error);
        showToast('Error updating selling price', 'error');
    });
}

function showAddStockModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('addStockModal');
    if (!modal) {
        modal = createAddStockModal();
        document.body.appendChild(modal);
    }

    // Clear form fields to prevent prefilled inputs
    document.getElementById('inventoryName').value = '';
    document.getElementById('category').value = '';
    document.getElementById('size').value = '';
    document.getElementById('unitSelect').value = '';
    document.getElementById('currentStock').value = '';
    document.getElementById('costPrice').value = '';

    // Reset display property and show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    loadUnitsForModal();
}

function createAddStockModal() {
    const modal = document.createElement('div');
    modal.id = 'addStockModal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Add Stock</h3>
                <button class="modal-close" onclick="closeModal('addStockModal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addStockForm">
                    <div class="form-group">
                        <label for="inventoryName" class="form-label">Item Name</label>
                        <input type="text" id="inventoryName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="category" class="form-label">Category</label>
                        <input type="text" id="category" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="size" class="form-label">Size</label>
                        <input type="text" id="size" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="unitSelect" class="form-label">Unit</label>
                        <select id="unitSelect" class="form-input" required>
                            <option value="">Select a unit</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="currentStock" class="form-label">Current Stock</label>
                        <input type="number" id="currentStock" class="form-input" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="costPrice" class="form-label">Cost Price (₱)</label>
                        <input type="number" id="costPrice" class="form-input" min="0" step="0.01" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('addStockModal')">Cancel</button>
                <button type="button" class="btn-primary" onclick="saveStock()">Save Stock</button>
            </div>
        </div>
    `;

    return modal;
}

function loadUnitsForModal() {
    fetch('db/product_units_get.php')
        .then(response => response.json())
        .then(units => {
            const unitSelect = document.getElementById('unitSelect');
            unitSelect.innerHTML = '<option value="">Select a unit</option>';

            if (units.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No units available";
                unitSelect.appendChild(option);
            } else {
                units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit.unit_name;
                    option.textContent = unit.unit_name;
                    unitSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading units:', error);
            showToast('Error loading units', 'error');
        });
}



function calculateProfit() {
    const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
    const currentStock = parseInt(document.getElementById('currentStock').value) || 0;
    
    const profitPerUnit = sellingPrice - costPrice;
    const profitMargin = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
    const totalValue = costPrice * currentStock;
    
    // Update display
    document.getElementById('profitMarginDisplay').textContent = `${profitMargin.toFixed(2)}%`;
    document.getElementById('profitPerUnit').textContent = `₱${profitPerUnit.toFixed(2)}`;
    document.getElementById('totalValueDisplay').textContent = `₱${totalValue.toFixed(2)}`;
    
    // Color coding
    const profitMarginElement = document.getElementById('profitMarginDisplay');
    const profitPerUnitElement = document.getElementById('profitPerUnit');
    
    if (profitMargin > 0) {
        profitMarginElement.style.color = '#059669';
        profitPerUnitElement.style.color = '#059669';
    } else if (profitMargin < 0) {
        profitMarginElement.style.color = '#dc2626';
        profitPerUnitElement.style.color = '#dc2626';
    } else {
        profitMarginElement.style.color = '#6b7280';
        profitPerUnitElement.style.color = '#6b7280';
    }
}

function saveStock() {
    const inventoryName = document.getElementById('inventoryName').value.trim();
    const category = document.getElementById('category').value.trim();
    const size = document.getElementById('size').value.trim();
    const unit = document.getElementById('unitSelect').value;
    const currentStock = document.getElementById('currentStock').value;
    const costPrice = document.getElementById('costPrice').value;

    if (!inventoryName || !category || !size || !unit || !currentStock || !costPrice) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Calculate total value
    const totalValue = costPrice * currentStock;

    fetch('db/inventory_add.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `InventoryName=${encodeURIComponent(inventoryName)}&Category=${encodeURIComponent(category)}&Size=${encodeURIComponent(size)}&Unit=${encodeURIComponent(unit)}&Current_Stock=${currentStock}&Cost_Price=${costPrice}&Total_Value=${totalValue}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Stock added successfully', 'success');
            closeModal('addStockModal');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error adding stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding stock:', error);
        showToast('Error adding stock', 'error');
    });
}

function showUpdateInventoryModal(inventoryID) {
    const item = inventoryData.find(item => item.inventoryID == inventoryID);
    if (!item) return;

    // Create modal if it doesn't exist
    let modal = document.getElementById('updateInventoryModal');
    if (!modal) {
        modal = createUpdateInventoryModal();
        document.body.appendChild(modal);
    }

    // Populate form fields with existing data
    document.getElementById('updateInventoryName').value = item['InventoryName'];
    document.getElementById('updateCategory').value = item['Category'];
    document.getElementById('updateSize').value = item['Size'];
    document.getElementById('updateCurrentStock').value = item['Current Stock'];
    document.getElementById('updateCostPrice').value = item['Cost Price'];

    // Store inventoryID for update
    modal.setAttribute('data-inventory-id', inventoryID);

    // Reset display property and show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    loadUnitsForUpdateModal(item['Unit']);
}

function createUpdateInventoryModal() {
    const modal = document.createElement('div');
    modal.id = 'updateInventoryModal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Update Inventory Item</h3>
                <button class="modal-close" onclick="closeModal('updateInventoryModal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="updateInventoryForm">
                    <div class="form-group">
                        <label for="updateInventoryName" class="form-label">Item Name</label>
                        <input type="text" id="updateInventoryName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="updateCategory" class="form-label">Category</label>
                        <input type="text" id="updateCategory" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="updateSize" class="form-label">Size</label>
                        <input type="text" id="updateSize" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="updateUnitSelect" class="form-label">Unit</label>
                        <select id="updateUnitSelect" class="form-input" required>
                            <option value="">Select a unit</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="updateCurrentStock" class="form-label">Current Stock</label>
                        <input type="number" id="updateCurrentStock" class="form-input" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="updateCostPrice" class="form-label">Cost Price (₱)</label>
                        <input type="number" id="updateCostPrice" class="form-input" min="0" step="0.01" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('updateInventoryModal')">Cancel</button>
                <button type="button" class="btn-primary" onclick="updateInventory()">Update Item</button>
            </div>
        </div>
    `;

    return modal;
}

function loadUnitsForUpdateModal(selectedUnit) {
    fetch('db/product_units_get.php')
        .then(response => response.json())
        .then(units => {
            const unitSelect = document.getElementById('updateUnitSelect');
            unitSelect.innerHTML = '<option value="">Select a unit</option>';

            if (units.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No units available";
                unitSelect.appendChild(option);
            } else {
                units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit.unit_name;
                    option.textContent = unit.unit_name;
                    if (unit.unit_name === selectedUnit) {
                        option.selected = true;
                    }
                    unitSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading units:', error);
            showToast('Error loading units', 'error');
        });
}

function updateInventory() {
    const modal = document.getElementById('updateInventoryModal');
    const inventoryID = modal.getAttribute('data-inventory-id');

    const inventoryName = document.getElementById('updateInventoryName').value.trim();
    const category = document.getElementById('updateCategory').value.trim();
    const size = document.getElementById('updateSize').value.trim();
    const unit = document.getElementById('updateUnitSelect').value;
    const currentStock = document.getElementById('updateCurrentStock').value;
    const costPrice = document.getElementById('updateCostPrice').value;

    if (!inventoryName || !category || !size || !unit || !currentStock || !costPrice) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Calculate total value
    const totalValue = costPrice * currentStock;

    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&InventoryName=${encodeURIComponent(inventoryName)}&Category=${encodeURIComponent(category)}&Size=${encodeURIComponent(size)}&Unit=${encodeURIComponent(unit)}&Current_Stock=${currentStock}&Cost_Price=${costPrice}&Total_Value=${totalValue}&action=update_inventory`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Inventory item updated successfully', 'success');
            closeModal('updateInventoryModal');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating inventory item', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating inventory:', error);
        showToast('Error updating inventory item', 'error');
    });
}

function exportInventory() {
    // Check if data is loaded
    if (!inventoryData || inventoryData.length === 0) {
        showToast('No inventory data to export. Please wait for data to load.', 'warning');
        return;
    }

    try {
        const csvContent = generateCSV();
        if (!csvContent || csvContent.trim() === '') {
            showToast('No data available to export', 'warning');
            return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Inventory data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting inventory:', error);
        showToast('Failed to export inventory data', 'error');
    }
}

function generateCSV() {
    const headers = ['InventoryName', 'Category', 'Size', 'Unit', 'Current_Stock', 'Cost_Price', 'Total_Value', 'Status'];
    const rows = filteredData.map(item => {
        return [
            item['InventoryName'],
            item['Category'],
            item['Size'],
            item['Unit'],
            item['Current_Stock'],
            item['Cost_Price'],
            item['Total_Value'],
            item['Status']
        ];
    });

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    return csvContent;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}
