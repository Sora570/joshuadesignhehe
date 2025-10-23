<?php
// db/products_getAll.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db_connect.php';

try {
    $sql = "SELECT
                p.productID,
                p.productName,
                p.categoryID,
                p.isActive,
                p.createdAt AS created_at,
                p.unit_type,
                c.categoryName
            FROM products p
            JOIN categories c ON p.categoryID = c.categoryID
            ORDER BY p.categoryID, p.productID";

    $res = $conn->query($sql);
    $out = [];

    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $pid = (int)$row['productID'];

            // Fetch sizes + price per size-unit for this product
            $sstmt = $conn->prepare("
                SELECT s.sizeID, s.sizeName, COALESCE(pp.price, s.defaultPrice) AS price, pp.unit_id, pu.unit_name, pu.unit_symbol
                FROM sizes s
                LEFT JOIN product_prices pp ON s.sizeID = pp.sizeID AND pp.productID = ?
                LEFT JOIN product_units pu ON pp.unit_id = pu.unit_id
                ORDER BY s.sizeID, pp.unit_id
            ");
            $sstmt->bind_param('i', $pid);
            $sstmt->execute();
            $sres = $sstmt->get_result();

            $sizes = [];
            $sizesMap = [];
            while ($s = $sres->fetch_assoc()) {
                if (!$s['sizeID'] || !$s['sizeName']) {
                    continue;
                }
                $sizeName = trim($s['sizeName']);
                if ($sizeName === '') {
                    continue;
                }
                $key = strtolower($sizeName);
                $price = isset($s['price']) ? floatval($s['price']) : 0.0;
                if (!isset($sizesMap[$key]) || $price > $sizesMap[$key]['price']) {
                    $sizesMap[$key] = [
                        'sizeID' => (int)$s['sizeID'],
                        'sizeName' => $sizeName,
                        'price' => $price,
                        'unit_id' => isset($s['unit_id']) ? (int)$s['unit_id'] : null,
                        'unit_name' => $s['unit_name'] ?? null,
                        'unit_symbol' => $s['unit_symbol'] ?? null
                    ];
                }
            }
            if (!empty($sizesMap)) {
                uasort($sizesMap, function ($a, $b) {
                    return strcmp($a['sizeName'], $b['sizeName']);
                });
                $sizes = array_values($sizesMap);
            }
            $row['sizes'] = $sizes;
            $out[] = $row;
        }
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
