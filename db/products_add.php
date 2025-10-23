<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/audit_log.php';

// Basic product info
$productName = $_POST['productName'] ?? '';
$categoryID  = intval($_POST['categoryID'] ?? 0);
$size        = $_POST['size'] ?? '';
$unitID      = intval($_POST['unit_id'] ?? 0);
$price       = floatval($_POST['price'] ?? 0);
$isActive    = isset($_POST['isActive']) ? 1 : 0;

// Validate
if (!$productName || !$categoryID || !$unitID) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields: product name, category, or unit']);
    exit;
}

// Get unit details
$unitStmt = $conn->prepare("SELECT unit_name FROM product_units WHERE unit_id = ?");
$unitStmt->bind_param("i", $unitID);
$unitStmt->execute();
$unitResult = $unitStmt->get_result();
$unitData = $unitResult->fetch_assoc();
$unitName = $unitData['unit_name'] ?? 'piece';

// Insert product
$stmt = $conn->prepare("INSERT INTO products (productName, categoryID, unit_type, unit_value, base_price, isActive) VALUES (?,?,?,?,?,?)");
$stmt->bind_param("sisddi", $productName, $categoryID, $unitName, 1.00, $price, $isActive);
if (!$stmt->execute()) {
    echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    exit;
}
$productID = $stmt->insert_id;

// If size is provided, add it to sizes table and create price entry
if (!empty($size)) {
    // Check if size exists, if not create it
    $sizeCheckStmt = $conn->prepare("SELECT sizeID FROM sizes WHERE sizeName = ?");
    $sizeCheckStmt->bind_param("s", $size);
    $sizeCheckStmt->execute();
    $sizeResult = $sizeCheckStmt->get_result();

    if ($sizeResult->num_rows > 0) {
        $sizeData = $sizeResult->fetch_assoc();
        $sizeID = $sizeData['sizeID'];
    } else {
        // Create new size
        $sizeInsertStmt = $conn->prepare("INSERT INTO sizes (sizeName, defaultPrice, isActive) VALUES (?, ?, 1)");
        $sizeInsertStmt->bind_param("sd", $size, $price);
        $sizeInsertStmt->execute();
        $sizeID = $sizeInsertStmt->insert_id;
    }

    // Add price entry if price > 0
    if ($price > 0) {
        $priceStmt = $conn->prepare("INSERT INTO product_prices (productID, sizeID, price) VALUES (?, ?, ?)");
        $priceStmt->bind_param("iid", $productID, $sizeID, $price);
        $priceStmt->execute();
    }
}

// Log audit activity
if (isset($_SESSION['userID'])) {
    logProductActivity($conn, $_SESSION['userID'], 'add', $productName, "Product ID: $productID, Category ID: $categoryID, Unit: $unitName, Size: $size, Price: ₱$price");
}

echo json_encode(['status' => 'success', 'message' => 'Product added successfully']);
