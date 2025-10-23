<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['userID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$productID = intval($_POST['productID'] ?? 0);
$sizeID = intval($_POST['sizeID'] ?? 0);
$quantity = intval($_POST['quantity'] ?? 1);
$addons = json_decode($_POST['addons'] ?? '[]', true);

if (!$productID) {
    echo json_encode(['status' => 'error', 'message' => 'Product ID required']);
    exit;
}

try {
    // Get product details
    $productQuery = "SELECT p.productName, c.categoryName, 
                            COALESCE(pp.price, s.defaultPrice) as price
                     FROM products p
                     JOIN categories c ON p.categoryID = c.categoryID
                     LEFT JOIN product_prices pp ON p.productID = pp.productID AND pp.sizeID = ?
                     LEFT JOIN sizes s ON s.sizeID = ?
                     WHERE p.productID = ? AND p.isActive = 1";
    
    $stmt = $conn->prepare($productQuery);
    $stmt->bind_param('iii', $sizeID, $sizeID, $productID);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();
    
    if (!$product) {
        echo json_encode(['status' => 'error', 'message' => 'Product not found']);
        exit;
    }
    
    // Calculate addon prices
    $addonTotal = 0;
    if (!empty($addons)) {
        $addonQuery = "SELECT addonName, price FROM product_addons WHERE addon_id IN (" . 
                      implode(',', array_fill(0, count($addons), '?')) . ")";
        $addonStmt = $conn->prepare($addonQuery);
        $addonStmt->bind_param(str_repeat('i', count($addons)), ...$addons);
        $addonStmt->execute();
        $addonResults = $addonStmt->get_result();
        
        while ($addon = $addonResults->fetch_assoc()) {
            $addonTotal += $addon['price'];
        }
    }
    
    $totalPrice = ($product['price'] + $addonTotal) * $quantity;
    
    // Return cart item data
    echo json_encode([
        'status' => 'success',
        'item' => [
            'productID' => $productID,
            'sizeID' => $sizeID,
            'productName' => $product['productName'],
            'categoryName' => $product['categoryName'],
            'sizeName' => $sizeID ? 'Size ' . $sizeID : 'Default',
            'quantity' => $quantity,
            'unitPrice' => $product['price'],
            'addonTotal' => $addonTotal,
            'totalPrice' => $totalPrice,
            'addons' => $addons
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
