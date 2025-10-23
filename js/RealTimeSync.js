// Real-Time Synchronization System
class RealTimeSync {
    constructor() {
        this.syncInterval = 30000; // 30 seconds
        this.isActive = false;
        this.lastSync = null;
        this.syncCallbacks = [];
    }

    // Initialize real-time sync
    init() {
        console.log('Initializing Real-Time Sync...');
        this.startSync();
        this.setupEventListeners();
        this.setupProductSync();
        this.setupTransactionSync();
    }

    // Start synchronization
    startSync() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.syncInterval);
        
        console.log('Real-time sync started');
    }

    // Stop synchronization
    stopSync() {
        if (!this.isActive) return;
        
        this.isActive = false;
        clearInterval(this.syncInterval);
        console.log('Real-time sync stopped');
    }

    // Perform synchronization
    async performSync() {
        try {
            console.log('Performing real-time sync...');
            
            // Sync products
            await this.syncProducts();
            
            // Sync transactions
            await this.syncTransactions();
            
            // Sync dashboard data
            await this.syncDashboard();
            
            this.lastSync = new Date();
            this.notifySyncComplete();
            
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    // Sync products
    async syncProducts() {
        try {
            const response = await fetch('db/products_getAll.php');
            if (response.ok) {
                const products = await response.json();
                
                // Dispatch product update event
                document.dispatchEvent(new CustomEvent('productsUpdated', {
                    detail: { products }
                }));
                
                // Update cashier products if on cashier page
                if (window.location.pathname.includes('cashier.html')) {
                    this.updateCashierProducts(products);
                }
            }
        } catch (error) {
            console.error('Product sync error:', error);
        }
    }

    // Sync transactions
    async syncTransactions() {
        try {
            const response = await fetch('db/transactions_get.php?limit=50');
            if (response.ok) {
                const data = await response.json();
                
                // Dispatch transaction update event
                document.dispatchEvent(new CustomEvent('transactionsUpdated', {
                    detail: { transactions: data.transactions }
                }));
            }
        } catch (error) {
            console.error('Transaction sync error:', error);
        }
    }

    // Sync dashboard
    async syncDashboard() {
        try {
            const response = await fetch('db/dashboard_analytics.php');
            if (response.ok) {
                const data = await response.json();
                
                // Dispatch dashboard update event
                document.dispatchEvent(new CustomEvent('dashboardUpdated', {
                    detail: { analytics: data }
                }));
            }
        } catch (error) {
            console.error('Dashboard sync error:', error);
        }
    }

    // Update cashier products
    updateCashierProducts(products) {
        // Update cashier product display
        if (typeof window.updateCashierProducts === 'function') {
            window.updateCashierProducts(products);
        }
        
        // Update product filters
        if (typeof window.updateProductFilters === 'function') {
            window.updateProductFilters(products);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for product changes
        document.addEventListener('productAdded', () => {
            console.log('Product added, triggering sync...');
            this.performSync();
        });

        document.addEventListener('productUpdated', () => {
            console.log('Product updated, triggering sync...');
            this.performSync();
        });

        document.addEventListener('productDeleted', () => {
            console.log('Product deleted, triggering sync...');
            this.performSync();
        });

        // Listen for transaction changes
        document.addEventListener('transactionCreated', () => {
            console.log('Transaction created, triggering sync...');
            this.performSync();
        });

        // Listen for category changes
        document.addEventListener('categoryAdded', () => {
            console.log('Category added, triggering sync...');
            this.performSync();
        });

        document.addEventListener('categoryUpdated', () => {
            console.log('Category updated, triggering sync...');
            this.performSync();
        });
    }

    // Setup product synchronization
    setupProductSync() {
        // Override product management functions to trigger sync
        const originalAddProduct = window.addProduct;
        if (originalAddProduct) {
            window.addProduct = async (...args) => {
                const result = await originalAddProduct(...args);
                document.dispatchEvent(new CustomEvent('productAdded'));
                return result;
            };
        }

        const originalUpdateProduct = window.updateProduct;
        if (originalUpdateProduct) {
            window.updateProduct = async (...args) => {
                const result = await originalUpdateProduct(...args);
                document.dispatchEvent(new CustomEvent('productUpdated'));
                return result;
            };
        }
    }

    // Setup transaction synchronization
    setupTransactionSync() {
        // Override transaction functions to trigger sync
        const originalCreateTransaction = window.createTransaction;
        if (originalCreateTransaction) {
            window.createTransaction = async (...args) => {
                const result = await originalCreateTransaction(...args);
                document.dispatchEvent(new CustomEvent('transactionCreated'));
                return result;
            };
        }
    }

    // Add sync callback
    addSyncCallback(callback) {
        this.syncCallbacks.push(callback);
    }

    // Notify sync complete
    notifySyncComplete() {
        this.syncCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Sync callback error:', error);
            }
        });
    }

    // Force immediate sync
    async forceSync() {
        console.log('Forcing immediate sync...');
        await this.performSync();
    }

    // Get sync status
    getStatus() {
        return {
            isActive: this.isActive,
            lastSync: this.lastSync,
            syncInterval: this.syncInterval
        };
    }
}

// Create global instance
window.realTimeSync = new RealTimeSync();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeSync.init();
});

// Expose functions globally
window.forceSync = () => window.realTimeSync.forceSync();
window.getSyncStatus = () => window.realTimeSync.getStatus();
window.startSync = () => window.realTimeSync.startSync();
window.stopSync = () => window.realTimeSync.stopSync();
