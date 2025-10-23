<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

$cat = isset($_GET['categoryID']) ? intval($_GET['categoryID']) : 0;
if (!$cat) { echo json_encode([]); exit; }

$stmt = $conn->prepare("SELECT productID, productName, isActive, categoryID FROM products WHERE categoryID=? ORDER BY productID");
$stmt->bind_param("i",$cat);
$stmt->execute();
$res = $stmt->get_result();
$out = [];
while ($r = $res->fetch_assoc()) {
    // fetch sizes and prices
    $pid = intval($r['productID']);
    $ps = $conn->prepare("SELECT s.sizeID, s.sizeName, pp.price FROM product_prices pp JOIN sizes s ON s.sizeID=pp.sizeID WHERE pp.productID=? ORDER BY s.sizeID");
    $ps->bind_param("i",$pid);
    $ps->execute();
    $prs = $ps->get_result();
    $sizes = [];
    while ($s = $prs->fetch_assoc()) $sizes[] = $s;
    $r['sizes'] = $sizes;
    $out[] = $r;
}
echo json_encode($out);
