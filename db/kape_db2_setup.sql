-- =============================================
-- KAPE_SYSTEM2 DATABASE SETUP
-- =============================================
-- Run this SQL script to complete your MySQL database setup
-- This includes all missing tables for the enhanced KAPE system features

USE kape_db2;

-- ====================================
-- AUDIT LOGGING TABLES
-- ====================================
-- Creates table for tracking user login/logout and system activities

CREATE TABLE IF NOT EXISTS audit_logs (
    logID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (userID),
    INDEX idx_action (action),
    INDEX idx_date (created_at)
);

-- ====================================
-- INVENTORY MANAGEMENT TABLES
-- ====================================

CREATE TABLE IF NOT EXISTS inventory (
    inventoryID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT NOT NULL,
    sizeID INT NOT NULL,
    currentStock INT NOT NULL DEFAULT 0,
    minStock INT NOT NULL DEFAULT 0,
    maxStock INT NOT NULL DEFAULT 100,
    costPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    sellingPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    profitMargin DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    totalValue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_size (productID, sizeID),
    INDEX idx_product (productID),
    INDEX idx_size (sizeID),
    INDEX idx_stock (currentStock)
);

CREATE TABLE IF NOT EXISTS inventory_history (
    historyID INT AUTO_INCREMENT PRIMARY KEY,
    inventoryID INT NOT NULL,
    changeType ENUM('adjustment', 'sale', 'restock', 'manual') NOT NULL,
    previousStock INT NOT NULL,
    newStock INT NOT NULL,
    changeAmount INT NOT NULL,
    reason VARCHAR(255),
    userID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inventory (inventoryID),
    INDEX idx_date (created_at)
);

-- ====================================
-- CASHIER CLOSEOUT TRACKING
-- ====================================

CREATE TABLE IF NOT EXISTS closeout_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cashier_id INT NOT NULL,
    cashier_name VARCHAR(100) NOT NULL,
    close_date DATE NOT NULL,
    high_sale_amount DECIMAL(10,2) DEFAULT 0,
    cash_counted DECIMAL(10,2) NOT NULL,
    over_short DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cashier (cashier_id),
    INDEX idx_date (close_date)
);

-- ====================================
-- ENHANCED ORDERS TABLES
-- ====================================

-- Update existing orders table structure if needed
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_type ENUM('none', 'senior_citizen', 'pwd') DEFAULT 'none',
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cash_received DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS change_given DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_method ENUM('cash', 'gcash', 'other') DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- ====================================
-- FOREIGN KEY CONSTRAINTS
-- ====================================

-- Ensure foreign key relationships work properly
-- Note: We'll set these up only after confirming all parent tables exist

-- Add foreign key constraints only if the tables exist
SET @has_users = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'kape_db2' AND table_name = 'users');
SET @has_products = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'kape_db2' AND table_name = 'products');
SET @has_sizes = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'kape_db2' AND table_name = 'sizes');

-- Add foreign key to audit_logs if users table exists
SET @sql = IF(@has_users > 0, 
    'ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_users FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE', 
    'SELECT "Users table not found, skipping foreign key constraint" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key to inventory if products and sizes tables exist
SET @sql = IF(@has_products > 0 AND @has_sizes > 0, 
    'ALTER TABLE inventory ADD CONSTRAINT fk_inventory_products FOREIGN KEY (productID) REFERENCES products(productID) ON DELETE CASCADE', 
    'SELECT "Required parent tables not found, skipping inventory foreign keys" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@has_products > 0 AND @has_sizes > 0, 
    'ALTER TABLE inventory ADD CONSTRAINT fk_inventory_sizes FOREIGN KEY (sizeID) REFERENCES sizes(sizeID) ON DELETE CASCADE', 
    'SELECT "Required parent tables not found, skipping inventory sizes foreign keys" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key to closeout_summaries if users table exists
SET @sql = IF(@has_users > 0, 
    'ALTER TABLE closeout_summaries ADD CONSTRAINT fk_closeout_users FOREIGN KEY (cashier_id) REFERENCES users(userID) ON DELETE CASCADE', 
    'SELECT "Users table not found, skipping closeout foreign key constraint" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key to inventory_history
SET @sql = IF(@has_products > 0 AND @has_sizes > 0, 
    'ALTER TABLE inventory_history ADD CONSTRAINT fk_inventory_history FOREIGN KEY (inventoryID) REFERENCES inventory(inventoryID) ON DELETE CASCADE', 
    'SELECT "Inventory table not found, skipping inventory history foreign key constraint" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ====================================
-- USERS TABLE ENHANCEMENT  
-- ====================================

-- Ensure users table has all required columns for new features
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) UNIQUE NULL,
ADD COLUMN IF NOT EXISTS shift_start TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS shift_end TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP NULL;

-- Create system settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert defaults  
INSERT IGNORE INTO system_settings (setting_name, value, description) VALUES 
('manager_override_pin', '$2y$10$h8H7EiaA1YI0ZYj8x62EGe1dQRJOlEkrKAyJKWQ/M.l1j.BnNdZHO', 'Manager override authorization PIN (default is hashed but you should change it)'),
('max_discount_without_override', '20', 'Automatic override is required for discounts above this percentage'),
('company_name', 'Kape Timplado', 'Business name'),
('system_version', '2.0', 'Running system version'),
('analytics_refresh_minutes', '5', 'Dashboard auto-refresh interval in minutes'),
('default_transaction_limit', '100', 'Default number of transactions to load in admin transactions view');

-- ====================================
-- ENHANCED PRODUCT MANAGEMENT SCHEMA
-- ====================================

-- Update products table for better normalization
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50) DEFAULT 'piece',
ADD COLUMN IF NOT EXISTS unit_value DECIMAL(10,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_trackable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS min_stock_level INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock_level INT DEFAULT 1000,
ADD COLUMN IF NOT EXISTS supplier_info TEXT NULL,
ADD COLUMN IF NOT EXISTS barcode VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) NULL;

-- Create product_units table for different unit types
CREATE TABLE IF NOT EXISTS product_units (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL,
    unit_symbol VARCHAR(10) NOT NULL,
    conversion_factor DECIMAL(10,4) DEFAULT 1.0000,
    is_base_unit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default units
INSERT IGNORE INTO product_units (unit_name, unit_symbol, conversion_factor, is_base_unit) VALUES 
('Piece', 'pc', 1.0000, TRUE),
('Ounce', 'oz', 1.0000, TRUE),
('Pound', 'lb', 16.0000, FALSE),
('Kilogram', 'kg', 35.2740, FALSE),
('Gram', 'g', 0.0353, FALSE),
('Liter', 'L', 33.8140, FALSE),
('Milliliter', 'mL', 0.0338, FALSE),
('Cup', 'cup', 8.0000, FALSE),
('Tablespoon', 'tbsp', 0.5000, FALSE),
('Teaspoon', 'tsp', 0.1667, FALSE);

-- Create product_addons table for product customization
CREATE TABLE IF NOT EXISTS product_addons (
    addon_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_name VARCHAR(100) NOT NULL,
    addon_type ENUM('topping', 'syrup', 'milk', 'sweetener', 'size', 'other') DEFAULT 'other',
    price DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_addon_relationships table
CREATE TABLE IF NOT EXISTS product_addon_relationships (
    relationship_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    addon_id INT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    max_quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(productID) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES product_addons(addon_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_addon (product_id, addon_id)
);

-- Create product_inventory table for stock tracking
CREATE TABLE IF NOT EXISTS product_inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0.00,
    reserved_stock DECIMAL(10,2) DEFAULT 0.00,
    available_stock DECIMAL(10,2) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(productID) ON DELETE CASCADE
);

-- Create inventory_transactions table for stock movement tracking
CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    reference_type ENUM('purchase', 'sale', 'adjustment', 'transfer', 'waste') DEFAULT 'adjustment',
    reference_id INT NULL,
    notes TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(productID) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(userID) ON DELETE SET NULL
);

-- ====================================
-- VERIFICATION QUERIES
-- ====================================

-- Show all tables in the database
SHOW TABLES;

-- Display table creation success confirmation
SELECT 
    'Setup Summary' as Status,
    'Database tables created/updated successfully!' as Message,
    NOW() as Completed_At;
