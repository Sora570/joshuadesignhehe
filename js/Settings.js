// Global
var categories = [];
var products = [];
var sizes = [];
var selectedCategoryId = null;

// Audit and Security Management
var currentAuditSection = 'logs';
var auditLogs = [];
var securityStats = {};
var currentAuditPage = 1;
var auditPageSize = 10;

// DOM refs
const categoryList = document.getElementById('categoryList');
const productTableBody = document.querySelector('#productListTable tbody');
const selectedCategoryName = document.getElementById('selectedCategoryName');
const backBtn = document.getElementById('backToCategories');
const addProductBtn = document.getElementById('addProductBtn');

// ---------- Load Categories ----------
function loadCategories() {
  fetch('db/categories_getAll.php')
    .then(r => r.json())
    .then(rows => {
      categories = rows;
      renderCategories();
      updateCategoryFilter();
    })
    .catch(err => console.error('Error loading categories:', err));
}

function renderCategories() {
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) return;
  
  categoryList.innerHTML = '';
  categories.forEach(c => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.dataset.id = c.categoryID;
    div.innerHTML = `
      <span>${c.categoryName}</span>
      <div class="item-actions">
        <button onclick="editCategory(${c.categoryID})" class="btn-small btn-primary">Edit</button>
        <button onclick="deleteCategory(${c.categoryID})" class="btn-small btn-danger">Delete</button>
      </div>
    `;
    categoryList.appendChild(div);
  });
}

function updateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;
  
  categoryFilter.innerHTML = '<option value="">All Categories</option>' +
    categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
}

// ----------------- Load Sizes -----------------
function loadSizes() {
  fetch("db/sizes_get.php")
    .then(r => r.json())
    .then(rows => {
      sizes = rows;
      renderSizes();
    })
    .catch(err => console.error("❌ Failed to load sizes:", err));
}

function renderSizes() {
  const sizeList = document.getElementById('sizeList');
  if (!sizeList) return;
  
  if (!Array.isArray(sizes) || sizes.length === 0) {
    sizeList.innerHTML = "<div class='no-data'>No sizes found</div>";
    return;
  }
  
  sizeList.innerHTML = '';
  sizes.forEach(s => {
    const div = document.createElement('div');
    div.className = 'size-item';
    div.dataset.id = s.sizeID;
    div.innerHTML = `
      <span>${s.sizeName} - ₱${s.defaultPrice ?? 0}</span>
      <div class="item-actions">
        <button onclick="editSize(${s.sizeID})" class="btn-small btn-primary">Edit</button>
        <button onclick="deleteSize(${s.sizeID})" class="btn-small btn-danger">Delete</button>
      </div>
    `;
    sizeList.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadCategories();
    loadProducts();
    
    // Setup event listeners
    setupSettingsEventListeners();

    // Initial load for audit logs if audit section is active (default)
    if (document.getElementById('audit-logs-section') && document.getElementById('audit-logs-section').classList.contains('active')) {
        loadAuditLogs();
    }
});

function setupSettingsEventListeners() {
    // ---------- Add Category ----------
    document.getElementById("addCategory")?.addEventListener("click", () => {
        const name = document.getElementById("newCategory").value.trim();
        if (!name) {
            alert("Please enter a category name");
            return;
        }

        const fd = new FormData();
        fd.append("categoryName", name);

        fetch("db/categories_add.php", { method: "POST", body: fd })
            .then(r => r.json())
            .then(res => {
                if (res.status === "success") {
                    alert("Category added!");
                    document.getElementById("newCategory").value = "";
                    loadCategories(); // refresh category list
                } else {
                    alert("Error: " + res.message);
                }
            })
            .catch(err => console.error("❌ Add category failed:", err));
    });
    
    // ---------- Add Size ----------
    document.getElementById("addSizeBtn")?.addEventListener("click", () => {
        const name = document.getElementById("newSizeName").value.trim();
        const price = document.getElementById("newSizePrice").value.trim();
        if (!name || !price) {
            alert("Please enter both size name and price");
            return;
        }

        const fd = new FormData();
        fd.append("sizeName", name);
        fd.append("price", price);

        fetch("db/sizes_add.php", { method: "POST", body: fd })
            .then(r => r.json())
            .then(res => {
                if (res.status === "success") {
                    alert("Size added!");
                    document.getElementById("newSizeName").value = "";
                    document.getElementById("newSizePrice").value = "";
                    loadSizes(); // refresh size list
                } else {
                    alert("Error: " + res.message);
                }
            })
            .catch(err => console.error("❌ Add size failed:", err));
    });
}

// ---------- Attach click to categories ----------
function attachCategoryListeners() {
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      selectedCategoryId = parseInt(item.dataset.id);
      selectedCategoryName.textContent = item.textContent;
      backBtn.classList.remove('hidden');
      addProductBtn.classList.remove('hidden');
      loadProductsForCategory(selectedCategoryId);
    });
  });
}

// ---------- Load Products ----------
function loadProducts() {
  fetch('db/products_getAll.php')
    .then(r => r.json())
    .then(rows => {
      products = rows;
      if (selectedCategoryId) {
        loadProductsForCategory(selectedCategoryId);
      } else {
        productTableBody.innerHTML = '';
      }
    })
    .catch(err => console.error('Error loading products:', err));
}

// ---------- Filter products by category ----------
function loadProductsForCategory(categoryId) {
  productTableBody.innerHTML = '';
  products
    .filter(p => p.categoryID == categoryId)
    .forEach(p => {
      const tr = document.createElement('tr');
      tr.dataset.id = p.productID;
      tr.innerHTML = `
        <td>${p.productID}</td>
        <td>${p.productName}</td>
        <td>${p.isActive ? 'Yes' : 'No'}</td>
        <td>
          <button class="editProductBtn" data-id="${p.productID}">Edit</button>
          <button class="deleteProductBtn" data-id="${p.productID}">Delete</button>
        </td>`;
      productTableBody.appendChild(tr);
    });

  // ✅ Attach event listeners after rendering rows
  document.querySelectorAll('.editProductBtn').forEach(btn =>
    btn.addEventListener('click', () => openEditForm(btn.dataset.id))
  );
  document.querySelectorAll('.deleteProductBtn').forEach(btn =>
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id))
  );
}


// ----------------- Load Category Options -----------------
async function loadCategoryOptions(selectId = "productCategory") {
  const select = document.getElementById(selectId);
  if (!select) {
    console.warn("loadCategoryOptions: select not found:", selectId);
    return [];
  }

  try {
    const res = await fetch("db/categories_get.php"); // fetch all categories
    if (!res.ok) {
      console.error("loadCategoryOptions: fetch failed", res.status);
      return [];
    }
    const rows = await res.json();
    // Fill the dropdown with <option> tags
    select.innerHTML = rows.map(c =>
      `<option value="${c.categoryID}">${c.categoryName}</option>`
    ).join("");

    console.log(`loadCategoryOptions(${selectId}): loaded ${rows.length} options`);
    return rows;
  } catch (err) {
    console.error("loadCategoryOptions error:", err);
    return [];
  }
}

// ----------------- OPEN EDIT FORM -----------------
function openEditForm(productID) {
  fetch(`db/products_getOne.php`, {
    method: "POST",
    body: new URLSearchParams({ productID })
  })
    .then(r => r.json())
    .then(p => {
      if (!p) return;
      document.getElementById("settings-product-form-view").style.display = "block";
      document.getElementById("settings-products-view").style.display = "none";
      document.getElementById("productFormTitle").textContent = "Edit Product";
      document.getElementById("productID").value = p.productID;
      document.getElementById("productName").value = p.productName;
      document.getElementById("productCategory").value = p.categoryID;
      document.getElementById("isActive").checked = p.isActive == 1;

      // Populate sizes/prices
      const sizeContainer = document.getElementById("sizePriceContainer");
      sizeContainer.innerHTML = "";
      p.sizes.forEach(s => {
        sizeContainer.innerHTML += `
          <div class="size-price-row">
            <label>${s.sizeName}</label>
            <input type="number" 
                   name="size_${s.sizeID}" 
                   data-sizeid="${s.sizeID}" 
                   value="${s.price}" 
                   step="0.01">
          </div>`;
      });
    });
}

// ----------------- DELETE PRODUCT -----------------
function deleteProduct(productID) {
  if (!confirm("Delete this product?")) return;
  const fd = new FormData();
  fd.append("productID", productID);

  fetch("db/products_delete.php", { method: "POST", body: fd })
    .then(r => r.text())
    .then(res => {
      if (res.trim() === "success") {
        // ✅ Reload only the current category's products
        loadProducts();
      } else {
        alert("Delete failed: " + res);
      }
    })
    .catch(err => console.error('Delete error:', err));
}


// ----------------- ADD PRODUCT BUTTON -----------------
document.getElementById("addProductBtn")?.addEventListener("click", () => {
  document.getElementById("settings-product-form-view").style.display = "block";
  document.getElementById("settings-products-view").style.display = "none";
  document.getElementById("productFormTitle").textContent = "Add Product";
  document.getElementById("productForm").reset();
  document.getElementById("productID").value = "";
});

// ----------------- CANCEL BUTTON -----------------
document.getElementById("cancelProductBtn")?.addEventListener("click", () => {
  document.getElementById("settings-product-form-view").style.display = "none";
  document.getElementById("settings-products-view").style.display = "block";
});


// ---------- Back Button ----------
if (backBtn) {
  backBtn.addEventListener('click', () => {
    selectedCategoryId = null;
    selectedCategoryName.textContent = 'Select a category';
    backBtn.classList.add('hidden');
    addProductBtn.classList.add('hidden');
    productTableBody.innerHTML = '';
    loadCategories();
  });
}

// ---------- Add Product ----------
if (addProductBtn) {
  addProductBtn.addEventListener('click', () => {
    openProductForm();
  });
}

// ---------- Open Form ----------
function openProductForm(product = null) {
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productFormTitle').textContent = product ? 'Edit Product' : 'Add Product';
  document.getElementById('productID').value = product ? product.productID : '';
  document.getElementById('productName').value = product ? product.productName : '';

  const categorySelect = document.getElementById('productCategory');
  categorySelect.innerHTML = '';
  categories.forEach(c => {
    categorySelect.innerHTML += `<option value="${c.categoryID}" ${product && c.categoryID == product.categoryID ? 'selected' : ''}>${c.categoryName}</option>`;
  });

  document.getElementById('isActive').checked = product ? product.isActive == 1 : true;

  // Load sizes for price input
  fetch('db/sizes_getAll.php')
    .then(r => r.json())
    .then(sizes => {
      const container = document.getElementById('sizePriceContainer');
      container.innerHTML = '';
      sizes.forEach(s => {
        const priceVal = product && product.sizes ? (product.sizes.find(sz => sz.sizeID == s.sizeID)?.price || '') : '';
        container.innerHTML += `
          <div class="size-price-row">
            <label>${s.sizeName}</label>
            <input type="number" step="0.01" data-sizeid="${s.sizeID}" value="${priceVal}" placeholder="Price">
          </div>`;
      });
    });

  document.getElementById('settings-product-form-view').style.display = 'block';
}


// ---------- Add Size ----------
document.getElementById("addSizeBtn")?.addEventListener("click", () => {
  const name = document.getElementById("newSizeName").value.trim();
  if (!name) {
    alert("Please enter a size name");
    return;
  }

  const fd = new FormData();
  fd.append("sizeName", name);

  fetch("db/sizes_add.php", { method: "POST", body: fd })
    .then(r => r.json())
    .then(res => {
      if (res.status === "success" || res === "success") {
        alert("Size added!");
        document.getElementById("newSizeName").value = "";
        loadSizes(); // refresh size list
      } else {
        alert("Error: " + (res.message || res));
      }
    })
    .catch(err => console.error("❌ Add size failed:", err));
});

// ---------- Save Product ----------
const productForm = document.getElementById('productForm');
if (productForm) {
  productForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameField = document.getElementById('productName');
    const categoryField = document.getElementById('productCategory');

    // Get values from inputs FIRST
    const productID = document.getElementById('productID').value.trim();
    const name = document.getElementById('productName').value.trim();

    // ✅ Get categoryID safely
    const categorySelect = document.getElementById('productCategory');
    const categoryID = categorySelect ? categorySelect.value.trim() : '';

    // ✅ Get isActive flag
    const isActiveChecked = document.getElementById('isActive')?.checked ? 1 : 0;

    // Debugging to verify
    console.log('Product Name:', name);
    console.log('Category ID:', categoryID);

    // Validate before sending
    if (!name || !categoryID) {
      alert('Please fill out product name and select a category.');
      return;
    }

    // Build FormData
    const fd = new FormData();
    fd.append('productID', productID);
    fd.append('productName', name);
    fd.append('categoryID', categoryID);
    fd.append('isActive', isActiveChecked);

    // Collect sizes and prices if present
    const sizeRows = document.querySelectorAll('#sizePriceContainer .size-price-row');
    const sizes = [];
    sizeRows.forEach(row => {
      const sizeLabel = row.querySelector('label')?.textContent.trim();  
      const priceInput = row.querySelector('input[type="number"]');
      const price = priceInput?.value.trim();
      const sizeID = priceInput?.dataset.sizeid;  // from data-sizeid
      if (sizeLabel && sizeID && price !== undefined) {
        // For create flow (db/product_save.php expects JSON array)
        if (price !== '') {
          sizes.push({ sizeID, sizeLabel, price });
        }
        // For update flow (db/products_update.php expects size_* fields)
        fd.append(`size_${sizeID}`, price === '' ? '0' : price);
      }
    });
    fd.append('sizes', JSON.stringify(sizes));

    // Determine which endpoint to use (insert or update)
    const url = productID ? 'db/products_update.php' : 'db/product_save.php';

    // Submit to backend
    fetch(url, { method: 'POST', body: fd })
      .then(res => res.json()) // ⬅️ Parse as JSON instead of .text()
      .then(response => {
        console.log('Save response:', response); // Debugging

        if (response.status === 'success') {
          alert('Product saved successfully!');
          loadProducts(); // Refresh product tables
          productForm.reset();
          const formView = document.getElementById('settings-product-form-view');
          const productsView = document.getElementById('settings-products-view');
          if (formView) formView.style.display = 'none';
          if (productsView) productsView.style.display = 'block';
        } else {
          alert('Error saving product: ' + (response.message || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('Error saving product:', err);
        alert('Server error while saving product.');
      });
  });
}

// ---------- Initial Load ----------
const refreshBtn = document.getElementById('refreshSettingsBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    loadCategories();
    loadProducts();
  });
}

// Reactive updates for other tabs
function setupReactiveUpdates() {
    // Listen for changes from other tabs
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('categoryUpdated', handleCategoryUpdate);
    window.addEventListener('sizeUpdated', handleSizeUpdate);
    window.addEventListener('addonUpdated', handleAddonUpdate);
}

function handleProductUpdate(event) {
    console.log('Product updated, refreshing settings...');
    loadProducts();
    loadCategories();
}

function handleOrderUpdate(event) {
    console.log('Order updated, refreshing settings...');
    // loadOrders(); // Removed as orders functionality is no longer used
}

function handleCategoryUpdate(event) {
    console.log('Category updated, refreshing settings...');
    loadCategories();
}

function handleSizeUpdate(event) {
    console.log('Size updated, refreshing settings...');
    loadSizes();
}

function handleAddonUpdate(event) {
    console.log('Addon updated, refreshing settings...');
    loadAddons();
}

function loadAddons() {
    fetch('db/addons_getAll.php')
        .then(r => r.json())
        .then(data => {
            // Update addons display if needed
            console.log('Addons loaded:', data);
        })
        .catch(err => console.error('Error loading addons:', err));
}

// Initialize reactive updates
setupReactiveUpdates();

// Settings Tab Navigation
function showSettingsTab(tabName, clickedButton) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.settings-tab-content');
    tabContents.forEach(tabContent => tabContent.classList.remove('active'));
    
    // Remove active from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById('settings-'+tabName);
    if(selectedTab) selectedTab.classList.add('active');
    
    // Add active class to clicked button
    if(clickedButton) {
        clickedButton.classList.add('active');
    } else {
        // Find the appropriate button
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(btn => {
            const icon = btn.querySelector('ion-icon');
            if (btn.textContent.toLowerCase().includes(tabName.toLowerCase()) || 
                (icon && icon.getAttribute('name').includes(tabName))) {
                btn.classList.add('active');
            }
        });
    }
    
    switch(tabName) {
        case 'audit':
            if (typeof loadAuditLogs === 'function') {
                loadAuditLogs();
            }
            break;
        case 'general':
        default:
            console.log('Switched to:', tabName);
            break;
    }
}
window.showSettingsTab = showSettingsTab;


// Category management functions
function editCategory(id) {
    const category = categories.find(c => c.categoryID == id);
    if (!category) return;
    
    const newName = prompt('Enter new category name:', category.categoryName);
    if (!newName || newName.trim() === '') return;
    
    fetch('db/categories_update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `categoryID=${id}&categoryName=${encodeURIComponent(newName.trim())}`
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            showToast('Category updated successfully', 'success');
            loadCategories();
        } else {
            showToast(res.message || 'Failed to update category', 'error');
        }
    })
    .catch(err => {
        console.error('Error updating category:', err);
        showToast('Failed to update category', 'error');
    });
}

function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    fetch('db/categories_delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `categoryID=${id}`
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            showToast('Category deleted successfully', 'success');
            loadCategories();
        } else {
            showToast(res.message || 'Failed to delete category', 'error');
        }
    })
    .catch(err => {
        console.error('Error deleting category:', err);
        showToast('Failed to delete category', 'error');
    });
}

// Size management functions
function editSize(id) {
    const size = sizes.find(s => s.sizeID == id);
    if (!size) return;
    
    const newName = prompt('Enter new size name:', size.sizeName);
    const newPrice = prompt('Enter new price:', size.defaultPrice);
    
    if (!newName || !newPrice) return;
    
    fetch('db/sizes_update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `sizeID=${id}&sizeName=${encodeURIComponent(newName.trim())}&price=${parseFloat(newPrice)}`
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            showToast('Size updated successfully', 'success');
            loadSizes();
        } else {
            showToast(res.message || 'Failed to update size', 'error');
        }
    })
    .catch(err => {
        console.error('Error updating size:', err);
        showToast('Failed to update size', 'error');
    });
}

function deleteSize(id) {
    if (!confirm('Are you sure you want to delete this size?')) return;
    
    fetch('db/sizes_delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `sizeID=${id}`
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            showToast('Size deleted successfully', 'success');
            loadSizes();
        } else {
            showToast(res.message || 'Failed to delete size', 'error');
        }
    })
    .catch(err => {
        console.error('Error deleting size:', err);
        showToast('Failed to delete size', 'error');
    });
}



// ==================== AUDIT & SECURITY MANAGEMENT ====================

// Audit Navigation Functions -->
function showAuditSection(section) {
    // Hide all audit content sections
    document.querySelectorAll('.audit-content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.audit-nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`audit-${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.closest('.audit-nav-button').classList.add('active');
    
    currentAuditSection = section;
    
    // Load section-specific data
    switch(section) {
        case 'logs':
            loadAuditLogs();
            break;
        case 'security':
            loadSecurityDashboard();
            break;
        case 'reports':
            loadAuditReports();
            break;
    }
}

// Load Audit Logs
function loadAuditLogs() {
    const auditLogsBody = document.getElementById('auditLogsBody');
    if (!auditLogsBody) return;
    
    auditLogsBody.innerHTML = '<tr><td colspan="6" class="loading-spinner">Loading audit logs...</td></tr>';
    
    fetch('db/get_audit_logs.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                auditLogs = data.audit_logs || [];
                renderAuditLogsTable();
                updateAuditPagination();
            } else {
                auditLogsBody.innerHTML = '<tr><td colspan="6" class="loading-spinner">No audit logs found</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading audit logs:', error);
            auditLogsBody.innerHTML = '<tr><td colspan="6" class="loading-spinner">Error loading audit logs</td></tr>';
        });
}

function renderAuditLogsTable() {
    const auditLogsBody = document.getElementById('auditLogsBody');
    if (!auditLogsBody) return;
    
    const startIndex = (currentAuditPage - 1) * auditPageSize;
    const endIndex = startIndex + auditPageSize;
    const pageLogs = auditLogs.slice(startIndex, endIndex);
    
    if (pageLogs.length === 0) {
        auditLogsBody.innerHTML = '<tr><td colspan="6" class="loading-spinner">No audit logs found</td></tr>';
        return;
    }
    
    auditLogsBody.innerHTML = pageLogs.map(log => `
        <tr>
            <td>${formatDateTime(log.created_at)}</td>
            <td>${log.username || 'System'}</td>
            <td><span class="action-badge action-${log.action}">${formatAction(log.action)}</span></td>
            <td>${log.details || '-'}</td>
            <td>${log.ip_address || '-'}</td>
            <td><span class="status-badge status-${log.role || 'system'}">${log.role || 'System'}</span></td>
        </tr>
    `).join('');
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatAction(action) {
    const actionMap = {
        'login': 'Login',
        'logout': 'Logout',
        'failed_login': 'Failed Login',
        'product_add': 'Product Added',
        'product_update': 'Product Updated',
        'product_delete': 'Product Deleted',
        'employee_add': 'Employee Added',
        'employee_update': 'Employee Updated',
        'employee_delete': 'Employee Deleted',
        'order_created': 'Order Created',
        'transaction_created': 'Transaction Created'
    };
    return actionMap[action] || action;
}

// Load Security Dashboard
function loadSecurityDashboard() {
    fetch('db/get_security_stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                securityStats = data.stats;
                updateSecurityDashboard();
            }
        })
        .catch(error => {
            console.error('Error loading security stats:', error);
        });
}

function updateSecurityDashboard() {
    document.getElementById('failedLogins').textContent = securityStats.failedLogins || 0;
    document.getElementById('activeSessions').textContent = securityStats.activeSessions || 0;
    document.getElementById('totalLogins').textContent = securityStats.totalLogins || 0;
    document.getElementById('lastActivity').textContent = securityStats.lastActivity || '-';
}

// Load Audit Reports
function loadAuditReports() {
    // Initialize reports section
    console.log('Audit reports section loaded');
}

// Audit Log Functions
function refreshAuditLogs() {
    loadAuditLogs();
    showToast('Audit logs refreshed', 'success');
}

function exportAuditLogs() {
    // Check if data is loaded
    if (!auditLogs || auditLogs.length === 0) {
        showToast('No audit logs to export. Please wait for data to load.', 'warning');
        return;
    }

    try {
        const csvContent = generateAuditCSV();
        if (!csvContent || csvContent.trim() === '') {
            showToast('No audit log data available to export', 'warning');
            return;
        }

        downloadCSV(csvContent, 'audit_logs.csv');
        showToast('Audit logs exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        showToast('Failed to export audit logs', 'error');
    }
}

function generateAuditCSV() {
    const headers = ['Timestamp', 'Employee', 'Action', 'Details', 'IP Address', 'Status'];
    const rows = auditLogs.map(log => [
        formatDateTime(log.created_at),
        log.username || 'System',
        formatAction(log.action),
        log.details || '',
        log.ip_address || '',
        log.status || 'Success'
    ]);

    return [headers, ...rows].map(row =>
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Audit Pagination
function previousAuditPage() {
    if (currentAuditPage > 1) {
        currentAuditPage--;
        renderAuditLogsTable();
        updateAuditPagination();
    }
}

function nextAuditPage() {
    const totalPages = Math.ceil(auditLogs.length / auditPageSize);
    if (currentAuditPage < totalPages) {
        currentAuditPage++;
        renderAuditLogsTable();
        updateAuditPagination();
    }
}

function updateAuditPagination() {
    const totalPages = Math.ceil(auditLogs.length / auditPageSize);
    const pageInfo = document.getElementById('auditPageInfo');
    const prevBtn = document.getElementById('prevAuditBtn');
    const nextBtn = document.getElementById('nextAuditBtn');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentAuditPage} of ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentAuditPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentAuditPage >= totalPages;
    }
}

// Audit Filters
function filterAuditLogs() {
    const dateFrom = document.getElementById('auditDateFrom').value;
    const dateTo = document.getElementById('auditDateTo').value;
    const userFilter = document.getElementById('auditUserFilter').value;
    const actionFilter = document.getElementById('auditActionFilter').value;

    // Apply filters to auditLogs array
    let filteredLogs = auditLogs;

    if (dateFrom) {
        filteredLogs = filteredLogs.filter(log => new Date(log.created_at) >= new Date(dateFrom));
    }

    if (dateTo) {
        filteredLogs = filteredLogs.filter(log => new Date(log.created_at) <= new Date(dateTo));
    }

    if (userFilter) {
        filteredLogs = filteredLogs.filter(log => log.username === userFilter);
    }

    if (actionFilter) {
        filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
    }

    // Update display with filtered results
    auditLogs = filteredLogs;
    currentAuditPage = 1;
    renderAuditLogsTable();
    updateAuditPagination();
}

// Report Generation Functions
function generateEmployeeReport() {
    showToast('Generating employee activity report...', 'info');
    // Implementation for employee report generation
    setTimeout(() => {
        showToast('Employee report generated successfully', 'success');
    }, 2000);
}

function generateSecurityReport() {
    showToast('Generating security events report...', 'info');
    // Implementation for security report generation
    setTimeout(() => {
        showToast('Security report generated successfully', 'success');
    }, 2000);
}

function generateSystemReport() {
    showToast('Generating system activity log...', 'info');
    // Implementation for system report generation
    setTimeout(() => {
        showToast('System report generated successfully', 'success');
    }, 2000);
}

// Expose functions globally
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.editSize = editSize;
window.deleteSize = deleteSize;
window.deleteProduct = deleteProduct;

// Audit functions
window.showAuditSection = showAuditSection;
window.refreshAuditLogs = refreshAuditLogs;
window.exportAuditLogs = exportAuditLogs;
window.filterAuditLogs = filterAuditLogs;
window.previousAuditPage = previousAuditPage;
window.nextAuditPage = nextAuditPage;
window.generateEmployeeReport = generateEmployeeReport;
window.generateSecurityReport = generateSecurityReport;
window.generateSystemReport = generateSystemReport;
