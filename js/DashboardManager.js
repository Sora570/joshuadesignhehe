// Comprehensive Dashboard Management System
let dashboardData = {
    products: 0,
    transactions: 0,
    dailySales: 0,
    orders: 0,
    topProducts: [],
    dailySalesChart: []
};

// Initialize Dashboard Manager
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupRealTimeUpdates();
});

// Initialize Dashboard
async function initializeDashboard() {
    console.log('Initializing Dashboard Manager...');
    
    try {
        await loadDashboardData();
        updateDashboardCards();
        updateCharts();
        showToast('Dashboard data loaded successfully', 'success');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Load all dashboard data in parallel
        const [analyticsResponse, productsResponse] = await Promise.all([
            fetch('db/dashboard_analytics.php'),
            fetch('db/products_getAll.php')
        ]);

        // Process analytics data
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            dashboardData.dailySales = analyticsData.daily_sales || 0;
            dashboardData.transactions = analyticsData.today_orders || 0;
            dashboardData.topProducts = analyticsData.top_products || [];
            dashboardData.dailySalesChart = analyticsData.chart_data || [];
        }

        // Process products data
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            dashboardData.products = productsData.length || 0;
        }

        // Load additional data
        await loadTransactionData();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
    }
}

// Load Transaction Data
async function loadTransactionData() {
    try {
        const response = await fetch('db/transactions_get.php?limit=100');
        if (response.ok) {
            const data = await response.json();
            dashboardData.orders = data.count || 0;
        }
    } catch (error) {
        console.error('Error loading transaction data:', error);
    }
}

// Update Dashboard Cards
function updateDashboardCards() {
    // Update product count
    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) {
        totalProductsEl.textContent = dashboardData.products;
    }

    // Update transaction count
    const todayTransactionsEl = document.getElementById('todayTransactions');
    if (todayTransactionsEl) {
        todayTransactionsEl.textContent = dashboardData.transactions;
    }

    // Update daily sales
    const dailySalesEl = document.getElementById('dailySalesAmount');
    if (dailySalesEl) {
        dailySalesEl.textContent = `₱${dashboardData.dailySales.toFixed(2)}`;
    }

    // Update orders
    const todayOrdersEl = document.getElementById('todayOrders');
    if (todayOrdersEl) {
        todayOrdersEl.textContent = dashboardData.orders;
    }
}

// Update Charts
function updateCharts() {
    updateTopProductsChart();
    updateDailySalesChart();
}

// Update Top Products Chart
function updateTopProductsChart() {
    const topProductsContainer = document.getElementById('topProductsList');
    if (!topProductsContainer) return;

    if (dashboardData.topProducts.length === 0) {
        topProductsContainer.innerHTML = '<div class="no-data">No product data available</div>';
        return;
    }

    topProductsContainer.innerHTML = dashboardData.topProducts.map((product, index) => `
        <div class="product-item">
            <div class="product-rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-stats">
                    <span class="order-count">${product.count} orders</span>
                    <span class="quantity-sold">${product.quantity} sold</span>
                </div>
            </div>
            <div class="product-bar">
                <div class="bar-fill" style="width: ${(product.count / dashboardData.topProducts[0].count) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

// Update Daily Sales Chart
function updateDailySalesChart() {
    const chartContainer = document.getElementById('dailySalesChart');
    if (!chartContainer) return;

    if (dashboardData.dailySalesChart.length === 0) {
        chartContainer.innerHTML = '<div class="no-data">No sales data available</div>';
        return;
    }

    // Create a simple bar chart
    const maxRevenue = Math.max(...dashboardData.dailySalesChart.map(d => d.revenue));
    
    chartContainer.innerHTML = `
        <div class="chart-header">
            <h3>Daily Sales Trend (Last 7 Days)</h3>
        </div>
        <div class="chart-bars">
            ${dashboardData.dailySalesChart.map(day => `
                <div class="chart-bar">
                    <div class="bar-label">${day.date_label}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="height: ${(day.revenue / maxRevenue) * 100}%"></div>
                    </div>
                    <div class="bar-value">₱${day.revenue}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Setup Real-time Updates
function setupRealTimeUpdates() {
    // Update dashboard every 5 minutes
    setInterval(async () => {
        try {
            await loadDashboardData();
            updateDashboardCards();
            updateCharts();
            console.log('Dashboard updated automatically');
        } catch (error) {
            console.error('Error in auto-update:', error);
        }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for product updates
    document.addEventListener('productUpdated', () => {
        console.log('Product updated, refreshing dashboard...');
        loadDashboardData().then(() => {
            updateDashboardCards();
            updateCharts();
        });
    });

    // Listen for transaction updates
    document.addEventListener('transactionUpdated', () => {
        console.log('Transaction updated, refreshing dashboard...');
        loadDashboardData().then(() => {
            updateDashboardCards();
            updateCharts();
        });
    });
}

// Manual refresh function
function refreshDashboard() {
    showToast('Refreshing dashboard...', 'info');
    initializeDashboard();
}

// Export Dashboard Data
function exportDashboardData() {
    const data = {
        timestamp: new Date().toISOString(),
        products: dashboardData.products,
        transactions: dashboardData.transactions,
        dailySales: dashboardData.dailySales,
        orders: dashboardData.orders,
        topProducts: dashboardData.topProducts,
        dailySalesChart: dashboardData.dailySalesChart
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Dashboard data exported successfully', 'success');
}

// Toast notifications
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

// Expose functions globally
window.refreshDashboard = refreshDashboard;
window.exportDashboardData = exportDashboardData;
