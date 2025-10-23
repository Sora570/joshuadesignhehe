-- Inventory Management Tables Setup
-- Run this SQL script to create the necessary tables for inventory management

-- Create inventory table to track stock levels for each product-size combination
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
    FOREIGN KEY (productID) REFERENCES products(productID) ON DELETE CASCADE,
    FOREIGN KEY (sizeID) REFERENCES sizes(sizeID) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (productID, sizeID)
);

-- Create inventory_history table to track stock changes
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
    FOREIGN KEY (inventoryID) REFERENCES inventory(inventoryID) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(productID);
CREATE INDEX IF NOT EXISTS idx_inventory_size ON inventory(sizeID);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(currentStock);
CREATE INDEX IF NOT EXISTS idx_history_inventory ON inventory_history(inventoryID);
CREATE INDEX IF NOT EXISTS idx_history_date ON inventory_history(created_at);

-- Update the products table to include inventory tracking flag (optional)
ALTER TABLE products ADD COLUMN IF NOT EXISTS trackInventory BOOLEAN DEFAULT TRUE;
