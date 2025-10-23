<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/audit_log.php';

$name = trim($_POST['sizeName'] ?? '');
$price = floatval($_POST['price'] ?? $_POST['defaultPrice'] ?? 0);

if (!$name) {
    echo json_encode(['status'=>'error','message'=>'Size name required']);
    exit;
}

// Insert new size
$stmt = $conn->prepare("INSERT INTO sizes (sizeName, defaultPrice, isActive) VALUES (?, ?, 1)");
$stmt->bind_param("sd", $name, $price);

if ($stmt->execute()) {
    // After inserting into sizes
    $sizeID = $conn->insert_id;

    // Add row into product_prices for all products
    $products = $conn->query("SELECT productID FROM products");
    $stmt2 = $conn->prepare("INSERT INTO product_prices (productID, sizeID, price) VALUES (?,?,0)");
    while ($row = $products->fetch_assoc()) {
        $pid = $row['productID'];
        $stmt2->bind_param("ii", $pid, $sizeID);
        $stmt2->execute();
}

    // Log audit activity
    if (isset($_SESSION['userID'])) {
        logSizeActivity($conn, $_SESSION['userID'], 'add', $name, "Size ID: $sizeID, Price: $price");
    }
    
    echo json_encode(['status'=>'success','sizeID'=>$sizeID]);
} else {
    echo json_encode(['status'=>'error','message'=>$stmt->error]);
}