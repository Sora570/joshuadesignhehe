-- Update Schema for Enhanced Product Management
USE kape_db2;

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
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT 'assest/image/no-image.png';

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

-- Insert sample addons
INSERT IGNORE INTO product_addons (addon_name, addon_type, price) VALUES 
('Extra Shot', 'other', 15.00),
('Oat Milk', 'milk', 10.00),
('Almond Milk', 'milk', 10.00),
('Vanilla Syrup', 'syrup', 5.00),
('Caramel Syrup', 'syrup', 5.00),
('Extra Sugar', 'sweetener', 0.00),
('No Sugar', 'sweetener', 0.00),
('Whipped Cream', 'topping', 8.00),
('Chocolate Chips', 'topping', 12.00);

-- Add unit_id to product_prices for per product-size-unit pricing
ALTER TABLE product_prices
ADD COLUMN unit_id INT NOT NULL DEFAULT 1 AFTER sizeID,
ADD CONSTRAINT fk_product_prices_unit_id FOREIGN KEY (unit_id) REFERENCES product_units(unit_id) ON DELETE CASCADE;

-- Update composite primary key to include unit_id
ALTER TABLE product_prices DROP PRIMARY KEY, ADD PRIMARY KEY (productID, sizeID, unit_id);

SELECT 'Schema update completed successfully!' as Status;
