<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['userID'])) {
    // For testing purposes, allow checkout without login
    // TODO: Remove this in production
    $_SESSION['userID'] = 1; // Default cashier ID
    // echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    // exit;
}

$cartItems = json_decode($_POST['cartItems'] ?? '[]', true);
$paymentMethod = $_POST['paymentMethod'] ?? 'cash';
$cashReceived = floatval($_POST['cashReceived'] ?? 0);

if (empty($cartItems)) {
    echo json_encode(['status' => 'error', 'message' => 'No items in cart']);
    exit;
}

$conn->begin_transaction();

try {
    // Calculate totals
    $subtotal = 0;
    foreach ($cartItems as $item) {
        $subtotal += ($item['unitPrice'] ?? 0) * ($item['quantity'] ?? 0);
    }

    $totalAmount = $subtotal;

    // Create order
    $orderQuery = "INSERT INTO orders (paymentMethod, cash_received, status, createdAt)
                   VALUES (?, ?, 'completed', NOW())";

    $stmt = $conn->prepare($orderQuery);
    $stmt->bind_param('sd', $paymentMethod, $cashReceived);
    $stmt->execute();
    $orderID = $conn->insert_id;
    
    // Create transaction record
    $transactionQuery = "INSERT INTO transactions (cashierID, orderSummary, totalAmount, paymentMethod, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $transactionStmt = $conn->prepare($transactionQuery);
    $orderSummary = json_encode($cartItems);
    $status = 'Completed';
    $transactionStmt->bind_param('isdss', $_SESSION['userID'], $orderSummary, $totalAmount, $paymentMethod, $status);
    $transactionStmt->execute();
    
    // Inventory deduction
    $sizeGroups = [];
    foreach ($cartItems as $item) {
        if (isset($item['sizeID']) && $item['sizeID']) {
            $sizeID = $item['sizeID'];
            if (!isset($sizeGroups[$sizeID])) {
                $sizeGroups[$sizeID] = ['qty' => 0, 'sizeName' => ''];
            }
            $sizeGroups[$sizeID]['qty'] += $item['quantity'];
        }
    }

    foreach ($sizeGroups as $sizeID => $group) {
        // Get size name
        $sizeStmt = $conn->prepare("SELECT sizeName FROM sizes WHERE sizeID = ?");
        $sizeStmt->bind_param('i', $sizeID);
        $sizeStmt->execute();
        $sizeResult = $sizeStmt->get_result()->fetch_assoc();
        if ($sizeResult) {
            $sizeName = $sizeResult['sizeName'];
            // Find cup inventory
            $invStmt = $conn->prepare("SELECT inventoryID, `Current_Stock` FROM inventory WHERE `InventoryName` = 'Cup' AND `Size` = ? AND `Unit` = 'Ounce'");
            $invStmt->bind_param('s', $sizeName);
            $invStmt->execute();
            $invResult = $invStmt->get_result()->fetch_assoc();
            if ($invResult) {
                $inventoryID = $invResult['inventoryID'];
                $currentStock = $invResult['Current_Stock'];
                if ($currentStock < $group['qty']) {
                    throw new Exception("Insufficient inventory for Cup {$sizeName}oz: need {$group['qty']}, have {$currentStock}");
                }
                // Deduct stock
                $newStock = $currentStock - $group['qty'];
                $updateStmt = $conn->prepare("UPDATE inventory SET `Current_Stock` = ? WHERE inventoryID = ?");
                $updateStmt->bind_param('ii', $newStock, $inventoryID);
                $updateStmt->execute();
            }
        }
    }

    // Log audit activity
    if (file_exists(__DIR__ . '/audit_log.php')) {
        require_once __DIR__ . '/audit_log.php';
        logOrderActivity($conn, $_SESSION['userID'], 'order_completed', "Order ID: $orderID, Total: $totalAmount");
    }

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'orderID' => $orderID,
        'totalAmount' => $totalAmount,
        'receipt' => [
            'orderID' => $orderID,
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'totalAmount' => $totalAmount,
            'paymentMethod' => $paymentMethod,
            'cashReceived' => $cashReceived,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
