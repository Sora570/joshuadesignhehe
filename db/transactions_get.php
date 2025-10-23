<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/db_connect.php';

try {
    // Temporarily disabled admin check for debugging
    /*
    // Check admin access - for sync, return empty if not admin
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(array(
            'status' => 'ok',
            'transactions' => [],
            'count' => 0,
            'total_revenue' => 0.0
        ));
        exit;
    }
    */
    
    // FILTER/SORT parameters from query
    $filterType = $_GET['type'] ?? 'all';
    $filterDate = $_GET['date'] ?? date('Y-m-d'); 
    $startDate = $_GET['start_date'] ?? null;
    $endDate = $_GET['end_date'] ?? null;
    $limit = intval($_GET['limit'] ?? 50);

    // // Order handling logic 
    $where = [];
    $params = [];
    
    if ($filterType !== 'all') {
        $where[] = 'o.status = ?';
        $params[] = $filterType;
    }
    
    // Date range filter optionally applied
    $date_field = 'o.createdAt';
    if ($startDate || $endDate) {
        if ($startDate && $endDate) {
            $where[] = "DATE($date_field) BETWEEN ? AND ?";
            $params[] = $startDate;
            $params[] = $endDate;
        } else {
            $where_cond = ($startDate) ?
                "DATE($date_field) >= ?" :
                "DATE($date_field) <= ?";
            $where[] = $where_cond;
            $params[] = ($startDate) ?? $endDate;
        }
    } else if (empty($startDate) && empty($endDate) && $filterDate) {
        $where[] = 'DATE(o.createdAt) = ?';
        $params[] = $filterDate;
    }

    $where_clause = implode(' AND ', $where);

    $query_sql = "
        SELECT
            o.orderID,
            o.totalAmount,
            o.payment_method,
            o.status,
            o.createdAt as order_date,
            u.employee_id as cashier_id
        FROM orders o
        LEFT JOIN users u ON u.userID = o.userID
        " . ($where_clause ? "WHERE $where_clause" : '') . "
        ORDER BY o.createdAt DESC
        LIMIT ?
    ";
    $params[] = $limit;
    
    $stmt = $conn->prepare($query_sql);
    if ($stmt === false) throw new Exception("Prepare failed: ".$conn->error);
    
    $types = str_repeat('s', count($params)-1) . 'i'; // last param is LIMIT
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result=$stmt->get_result();
    $transactions = [];
    
    while($row = $result->fetch_assoc()){
        $transactions[] = array(
            'orderID'       => (int)($row['orderID'] ?? 0),
            'totalAmount'   => floatval($row['totalAmount'] ?? 0),
            'order_date'    => substr($row['order_date'] ?? '',0,19),
            'status'        => $row['status'] ?? '',
            'payment_method' => $row['payment_method'] ?? '',
            'cashier_id'    => $row['cashier_id'] ?? 'manual'
        );
    }
    $stmt->close();

    // Summary data
    $summary_q = "
        SELECT
         COUNT(o.orderID) as transaction_count,
         COALESCE(SUM(o.totalAmount),0) as total_revenue
         FROM orders o
         " . ($where_clause ? "WHERE $where_clause" : '') . "
    ";
    $summary_stmt = $conn->prepare($summary_q);
    if ($summary_stmt === false) throw new Exception("Summary prepare failed: ".$conn->error);
    $summary_params = array_slice($params, 0, -1); // Remove LIMIT param
    if (!empty($summary_params)) {
        $param_types = str_repeat('s', count($summary_params));
        $summary_stmt->bind_param($param_types, ...$summary_params);
    }
    $summary_stmt->execute();
    $summary = $summary_stmt->get_result()->fetch_array();
    $summary_stmt->close();
    
    echo json_encode(array(
        'status' => 'ok',
        'transactions' => $transactions,
        'count' => intval($summary[0] ?? 0),
        'total_revenue' => floatval($summary[1] ?? 0)
    ));
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}  ?>
