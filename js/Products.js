// Products Management JavaScript
var products = [];
var categories = [];
var sizes = [];

// Initialize Products when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadCategories();
    loadSizes();
    loadProducts();
    
    // Setup event listeners
    setupProductsEventListeners();
});

function setupProductsEventListeners() {
    // Product search
    document.getElementById('productSearch')?.addEventListener('input', filterProducts);
    
    // Category filter
    document.getElementById('categoryFilter')?.addEventListener('change', filterProducts);
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('db/categories_getAll.php');
        categories = await response.json();
        updateCategoryFilter();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
}

// Load sizes
async function loadSizes() {
    try {
        const response = await fetch('db/sizes_get.php');
        sizes = await response.json();
    } catch (error) {
        console.error('Error loading sizes:', error);
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch('db/products_getAll.php');
        const data = await response.json();
        products = data.products || data;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.productID}">
            <div class="product-image">
                <img src="${product.image_url || 'assest/image/no-image.png'}" alt="${product.productName}" 
                     onerror="this.src='assest/image/no-image.png'">
                <div class="product-overlay">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.productID}, '${product.productName}')">
                        <ion-icon name="add-outline"></ion-icon>
                        Add to Cart
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.productName}</h3>
                <p class="product-category">${product.categoryName}</p>
                <div class="product-sizes">
                    ${product.sizes ? product.sizes.map(size => `
                        <button class="size-btn" onclick="selectSize(${product.productID}, ${size.sizeID}, '${size.sizeName}', ${size.price})">
                            ${size.sizeName} - ₱${size.price}
                        </button>
                    `).join('') : ''}
                </div>
                <div class="product-status">
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.productName.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.categoryID == categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product-id="${product.productID}">
            <div class="product-image">
                <img src="${product.image_url || 'assest/image/no-image.png'}" alt="${product.productName}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.productName}</h3>
                <p class="product-category">${product.categoryName}</p>
                <div class="product-sizes">
                    ${product.sizes ? product.sizes.map(size => `
                        <span class="size-tag">${size.sizeName} - ₱${size.price}</span>
                    `).join('') : ''}
                </div>
                <div class="product-status">
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Modal functions for adding categories, sizes, and products (admin only)
function showAddCategoryModal() {
    // Check if user is admin
    if (window.USER_ROLE !== 'admin') {
        alert('Only administrators can add categories.');
        return;
    }
    
    console.log('Add Category button clicked');
    const categoryName = prompt('Enter category name:');
    if (categoryName && categoryName.trim()) {
        console.log('Adding category:', categoryName);
        addCategory(categoryName.trim());
    }
}

function showAddSizeModal() {
    // Check if user is admin
    if (window.USER_ROLE !== 'admin') {
        alert('Only administrators can add sizes.');
        return;
    }
    
    console.log('Add Size button clicked');
    const sizeName = prompt('Enter size name:');
    if (!sizeName || !sizeName.trim()) return;
    
    const price = prompt('Enter default price:');
    if (!price || isNaN(parseFloat(price))) {
        alert('Please enter a valid price');
        return;
    }
    
    console.log('Adding size:', sizeName, 'with price:', price);
    addSize(sizeName.trim(), parseFloat(price));
}

function showAddProductModal() {
    // Check if user is admin
    if (window.USER_ROLE !== 'admin') {
        alert('Only administrators can add products.');
        return;
    }
    
    // Simple product addition - in a real system, this would be a proper modal
    const productName = prompt('Enter product name:');
    if (!productName || !productName.trim()) return;
    
    // Get categories for selection
    if (categories.length === 0) {
        alert('Please add categories first');
                return;
            }

    let categoryOptions = 'Select category:\n';
    categories.forEach((cat, index) => {
        categoryOptions += `${index + 1}. ${cat.categoryName}\n`;
    });
    
    const categoryChoice = prompt(categoryOptions);
    const categoryIndex = parseInt(categoryChoice) - 1;
    
    if (categoryIndex < 0 || categoryIndex >= categories.length) {
        alert('Invalid category selection');
                return;
            }

    addProduct(productName.trim(), categories[categoryIndex].categoryID);
}

function addCategory(categoryName) {
    console.log('addCategory called with:', categoryName);
    const formData = new FormData();
    formData.append('categoryName', categoryName);
    
    console.log('Sending request to categories_add.php');
    fetch('db/categories_add.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response received:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.status === 'success') {
            alert('Category added successfully!');
            loadCategories();
            loadProducts(); // Refresh products to show new category
            
            // Notify other tabs/windows about the update
            if (typeof ProductSync !== 'undefined') {
                window.dispatchEvent(new CustomEvent('productsUpdated', {
                    detail: { action: 'category_added', data: { categoryName } }
                }));
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding category:', error);
        alert('Failed to add category');
    });
}

function addSize(sizeName, price) {
    console.log('addSize called with:', sizeName, price);
    const formData = new FormData();
    formData.append('sizeName', sizeName);
    formData.append('price', price);
    
    console.log('Sending request to sizes_add.php');
    fetch('db/sizes_add.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response received:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.status === 'success') {
            alert('Size added successfully!');
            loadSizes();
            loadProducts(); // Refresh products to show new size
            
            // Notify other tabs/windows about the update
            if (typeof ProductSync !== 'undefined') {
                window.dispatchEvent(new CustomEvent('productsUpdated', {
                    detail: { action: 'size_added', data: { sizeName, price } }
                }));
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding size:', error);
        alert('Failed to add size');
    });
}

function addProduct(productName, categoryID) {
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('categoryID', categoryID);
    formData.append('isActive', '1');
    
    fetch('db/products_add.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Product added successfully!');
            loadProducts();
            
            // Notify other tabs/windows about the update
            if (typeof ProductSync !== 'undefined') {
                window.dispatchEvent(new CustomEvent('productsUpdated', {
                    detail: { action: 'product_added', data: { productName, categoryID } }
                }));
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding product:', error);
        alert('Failed to add product');
    });
}

// POS functionality for cashier
function addToCart(productID, productName) {
    console.log('Adding to cart:', productID, productName);
    // This will be handled by the POS system
    if (typeof window.addToOrder === 'function') {
        window.addToOrder(productID, productName);
    } else {
        alert('Product added to cart: ' + productName);
    }
}

function selectSize(productID, sizeID, sizeName, price) {
    console.log('Size selected:', productID, sizeID, sizeName, price);
    // This will be handled by the POS system
    if (typeof window.selectProductSize === 'function') {
        window.selectProductSize(productID, sizeID, sizeName, price);
    } else {
        alert('Size selected: ' + sizeName + ' - ₱' + price);
    }
}

// Image upload functionality (admin-only)
function showImageUploadModal() {
    // Check if user is admin
    if (window.USER_ROLE !== 'admin') {
        alert('Only administrators can upload product images.');
        return;
    }
    
    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'block';
        loadProductsForImageUpload();
    }
}

function closeImageUploadModal() {
    const modal = document.getElementById('imageUploadModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('imageUploadForm').reset();
    }
}

function loadProductsForImageUpload() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    fetch('db/get_products.php')
        .then(response => response.json())
        .then(data => {
            if (data.products) {
                productSelect.innerHTML = '<option value="">Choose a product...</option>' +
                    data.products.map(product => 
                        `<option value="${product.productID}">${product.productName}</option>`
                    ).join('');
            }
        })
        .catch(error => {
            console.error('Error loading products for image upload:', error);
        });
}

function uploadProductImage() {
    const form = document.getElementById('imageUploadForm');
    const formData = new FormData(form);
    
    fetch('db/upload_product_image.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Image uploaded successfully!');
            closeImageUploadModal();
            loadProducts(); // Refresh products to show new image
            
            // Notify other tabs/windows about the update
            if (typeof ProductSync !== 'undefined') {
                window.dispatchEvent(new CustomEvent('productsUpdated', {
                    detail: { action: 'image_uploaded', data: { productID: data.productID } }
                }));
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
    });
}

// Initialize form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Image upload form handler
    const imageUploadForm = document.getElementById('imageUploadForm');
    if (imageUploadForm) {
        imageUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadProductImage();
        });
    }
});

// Expose functions globally
window.loadProducts = loadProducts;
window.loadCategories = loadCategories;
window.loadSizes = loadSizes;
window.showAddCategoryModal = showAddCategoryModal;
window.showAddSizeModal = showAddSizeModal;
window.showAddProductModal = showAddProductModal;
window.showImageUploadModal = showImageUploadModal;
window.closeImageUploadModal = closeImageUploadModal;
window.uploadProductImage = uploadProductImage;
window.addToCart = addToCart;
window.selectSize = selectSize;
