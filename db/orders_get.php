<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

// Check if user is logged in
if (!isset($_SESSION['userID'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

try {
    // Get orders from database
    $query = "SELECT
                o.orderID,
                o.paymentMethod,
                o.cash_received,
                o.status,
                o.createdAt,
                GROUP_CONCAT(
                    CONCAT(p.productName,
                           CASE WHEN s.sizeName IS NOT NULL THEN CONCAT(' (', s.sizeName, ')') ELSE '' END,
                           ' x', ot.quantity)
                    SEPARATOR ', '
                ) as items,
                SUM(ot.quantity * ot.unitPrice) as totalAmount
              FROM orders o
              LEFT JOIN order_items ot ON o.orderID = ot.orderID
              LEFT JOIN products p ON ot.productID = p.productID
              LEFT JOIN sizes s ON ot.sizeID = s.sizeID
              GROUP BY o.orderID
              ORDER BY o.createdAt DESC";

    $result = $conn->query($query);

    $orders = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = [
                'orderID' => $row['orderID'],
                'items' => $row['items'] ?: 'No items',
                'totalAmount' => floatval($row['totalAmount'] ?: 0),
                'paymentMethod' => $row['paymentMethod'],
                'status' => $row['status'],
                'createdAt' => $row['createdAt']
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'pending' => array_filter($orders, fn($o) => $o['status'] === 'pending'),
        'completed' => array_filter($orders, fn($o) => $o['status'] === 'completed')
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$conn->close();
?>
