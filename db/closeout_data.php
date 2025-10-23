<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/db_connect.php';

try {
    // Check if user is logged in as cashier
    if (!isset($_SESSION['userID']) || $_SESSION['role'] !== 'cashier') {
        throw new Exception('Cashier access required');
    }
    
    // Get today's date
    $today = date('Y-m-d');
    
    // Get orders count and sales data for today
    $query = "
        SELECT 
            COUNT(o.orderID) as orderCount,
            COALESCE(SUM(oi.price * oi.quantity), 0) as grossSales,
            COALESCE(SUM(CASE WHEN o.discount_type = 'senior_citizen' THEN (oi.price * oi.quantity * 0.20) 
                              WHEN o.discount_type = 'pwd' THEN (oi.price * oi.quantity * 0.20)
                              ELSE 0 END), 0) as totalDiscounts
        FROM orders o
        JOIN order_items oi ON o.orderID = oi.orderID  
        WHERE DATE(o.createdAt) = ? AND o.status = 'completed'
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $today);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    $stmt->close();
    
    // Calculate totals
    $orderCount = intval($data['orderCount'] ?? 0);
    $grossSales = floatval($data['grossSales'] ?? 0);
    $totalDiscounts = floatval($data['totalDiscounts'] ?? 0);
    $netSales = $grossSales - $totalDiscounts;
    
    $closeoutData = [
        'orderCount' => $orderCount,
        'grossSales' => $grossSales,
        'totalDiscounts' => $totalDiscounts,
        'netSales' => $netSales
    ];
    
    echo json_encode($closeoutData);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
