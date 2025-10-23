<?php
header('Content-Type: application/json');

// Include database connections 
require_once 'db_connect.php';

function get_top_5_products(){
    try{
        global $conn;
        $query = "
            SELECT 
                   p.productName as product_name,
                   COUNT(DISTINCT o.orderID) as order_count,
                   SUM(oi.quantity) as total_quantity
            FROM products p
            LEFT JOIN order_items oi ON p.productID = oi.productID
            LEFT JOIN orders o ON oi.orderID = o.orderID
            WHERE DATE(o.createdAt) = CURDATE()
                AND o.status = 'completed'
            GROUP BY p.productID, p.productName
            ORDER BY total_quantity DESC, order_count DESC
            LIMIT 5
            ";
            
        $stmt = $conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Prepare failed: ".$conn->error);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];
        
        while($row = $result->fetch_assoc()){
            $products[] = [
                'name' => $row['product_name'],
                'count' => intval($row['order_count']),
                'quantity' => intval($row['total_quantity'])
            ];
        }
        
        $stmt->close();
        return $products;
        
    } catch(Exception $e){
        error_log("Analytics Error: ".$e->getMessage());
        return [];
    }
}

function get_today_sales_total(){
    try{
        global $conn;
        // Calculate total sales for today from completed orders
        $query = "
            SELECT 
                COALESCE(SUM(oi.price * oi.quantity), 0) as today_total
            FROM orders o
            JOIN order_items oi ON o.orderID = oi.orderID
            WHERE DATE(o.createdAt) = CURDATE()
                AND o.status = 'completed'
        ";
        
        $stmt = $conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Prepare failed: ".$conn->error);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        $stmt->close();
        
        return floatval($data['today_total'] ?? 0);
        
    } catch(Exception $e){
        error_log("Analytics Error: ".$e->getMessage());
        return 0;
    }
}

function get_today_orders_count(){
    try{
        global $conn;
        $query = "
            SELECT COUNT(*) as orders_count
            FROM orders o
            WHERE DATE(o.createdAt) = CURDATE()
                AND o.status = 'completed'
        ";
        
        $stmt = $conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Prepare failed: ".$conn->error);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        $stmt->close();
        
        return intval($data['orders_count'] ?? 0);
        
    } catch(Exception $e){
        error_log("Analytics Error: ".$e->getMessage());
        return 0;
    }
}

function get_daily_sales_chart_data(){
    try{
        global $conn;
        
        // Get comprehensive 7-day sales data with better aggregation
        $query = "
            SELECT 
                DATE(o.createdAt) as sale_date,
                DATE_FORMAT(DATE(o.createdAt), '%b %d') as date_label,
                COUNT(DISTINCT o.orderID) as orders_count,
                COALESCE(SUM(oi.quantity * oi.price), 0) as daily_revenue,
                COALESCE(SUM(oi.quantity), 0) as daily_items_sold
            FROM orders o
            LEFT JOIN order_items oi ON o.orderID = oi.orderID
            WHERE DATE(o.createdAt) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                AND o.status IN ('completed', 'delivered')
            GROUP BY DATE(o.createdAt)
            ORDER BY sale_date ASC
        ";
        
        $stmt = $conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Prepare failed: ".$conn->error);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        
        // Generate all dates in the 7-day range and fill with zeros if needed
        $dates = [];
        for($i = 6; $i >= 0; $i--){
            $dates[] = date('Y-m-d', strtotime("-{$i} days"));
        }
        
        while($row = $result->fetch_assoc()){
            $data[] = [
                'date' => $row['sale_date'],
                'date_label' => $row['date_label'],
                'orders' => intval($row['orders_count']),
                'revenue' => round(floatval($row['daily_revenue']) * 0.01, 0), // Convert cents or base prices up
                'daily_items_sold' => intval($row['daily_items_sold'])
            ];
        }
        
        // Fill missing dates with zeros
        $fullData = [];
        foreach($dates as $date){
            $found = null;
            foreach($data as $datum) {
                if($datum['date'] == $date) {
                    $found = $datum;
                    break;
                }
            }
            
            $fullData[] = $found ?? [
                'date' => $date, 
                'date_label' => date('M d', strtotime($date)) ,
                'orders' => 0, 
                'revenue' => 0, 
                'daily_items_sold' => 0
            ];
        }
        
        $stmt->close();
        return $fullData;
        
    } catch(Exception $e){
        error_log("Analytics Error: ".$e->getMessage());
        return array_map(function($i) {
            return [
                'date' => date('Y-m-d', strtotime("-{$i} days")),
                'date_label' => date('M d', strtotime("-{$i} days")),
                'orders' => 0,
                'revenue' => 0,
                'daily_items_sold' => 0
            ];
        }, range(6,0));
    }
}

try {
    if (!isset($_SESSION)) {
        session_start();
    }
    
    // Ensure user is logged in and admin
    if (!isset($_SESSION['userID']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Unauthorized access. Admin role required.");
    }
    
    $action = $_POST['action'] ?? $_GET['action'] ?? 'all';
    
    switch($action) {
        case 'top_products':
            echo json_encode(get_top_5_products());
            break;
            
        case 'daily_sales':
            echo json_encode(['daily_sales' => get_today_sales_total()]);
            break;
            
        case 'all':
        default:
            echo json_encode([
                'top_products' => get_top_5_products(),
                'daily_sales' => get_today_sales_total(),
                'today_orders' => get_today_orders_count(),
                'chart_data' => get_daily_sales_chart_data()
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
