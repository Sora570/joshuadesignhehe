<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

try {
    // Get all products with their details
    $query = "SELECT 
                p.productID,
                p.productName,
                p.description,
                p.categoryID,
                c.categoryName,
                p.image_url,
                p.isActive,
                p.created_at,
                GROUP_CONCAT(
                    CONCAT(s.sizeName, ':', sp.price) 
                    ORDER BY s.sizeOrder 
                    SEPARATOR '|'
                ) as sizes
              FROM products p
              LEFT JOIN categories c ON p.categoryID = c.categoryID
              LEFT JOIN product_prices sp ON p.productID = sp.productID
              LEFT JOIN sizes s ON sp.sizeID = s.sizeID
              WHERE p.isActive = 1
              GROUP BY p.productID
              ORDER BY p.productName";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Parse sizes
        $sizes = [];
        if ($row['sizes']) {
            $sizePairs = explode('|', $row['sizes']);
            foreach ($sizePairs as $pair) {
                if (strpos($pair, ':') !== false) {
                    list($sizeName, $price) = explode(':', $pair, 2);
                    $sizes[] = [
                        'name' => $sizeName,
                        'price' => floatval($price)
                    ];
                }
            }
        }
        
        $products[] = [
            'productID' => $row['productID'],
            'productName' => $row['productName'],
            'description' => $row['description'],
            'categoryID' => $row['categoryID'],
            'categoryName' => $row['categoryName'],
            'image_url' => $row['image_url'],
            'isActive' => $row['isActive'],
            'created_at' => $row['created_at'],
            'sizes' => $sizes
        ];
    }
    
    echo json_encode([
        'status' => 'success',
        'products' => $products
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
