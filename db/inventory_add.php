<?php
// db/inventory_add.php
require_once __DIR__ . '/db_connect.php';
header('Content-Type: application/json');

$inventoryName = trim($_POST['InventoryName'] ?? '');
$category = trim($_POST['Category'] ?? '');
$size = trim($_POST['Size'] ?? '');
$unit = trim($_POST['Unit'] ?? '');
$currentStock = intval($_POST['Current_Stock'] ?? 0);
$costPrice = floatval($_POST['Cost_Price'] ?? 0);
$totalValue = floatval($_POST['Total_Value'] ?? 0);
$status = trim($_POST['Status'] ?? 'Active');

// Validate input
if (!$inventoryName || !$category || !$size || !$unit) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

if ($currentStock < 0) {
    echo json_encode(['status' => 'error', 'message' => 'Stock values cannot be negative']);
    exit;
}

if ($costPrice < 0) {
    echo json_encode(['status' => 'error', 'message' => 'Prices cannot be negative']);
    exit;
}

$conn->begin_transaction();

try {
    // Check if inventory entry already exists
    $checkStmt = $conn->prepare("SELECT inventoryID FROM inventory WHERE `InventoryName` = ? AND `Category` = ? AND `Size` = ? AND `Unit` = ?");
    $checkStmt->bind_param('ssss', $inventoryName, $category, $size, $unit);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();

    if ($existing) {
        echo json_encode(['status' => 'error', 'message' => 'Inventory entry already exists for this item']);
        exit;
    }

    // Insert new inventory entry
    $stmt = $conn->prepare("INSERT INTO inventory (`InventoryName`, `Category`, `Size`, `Unit`, `Current_Stock`, `Cost_Price`, `Total_Value`, `Status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('ssssidss', $inventoryName, $category, $size, $unit, $currentStock, $costPrice, $totalValue, $status);

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    $inventoryID = $conn->insert_id;

    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Inventory entry added successfully', 'inventoryID' => $inventoryID]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
